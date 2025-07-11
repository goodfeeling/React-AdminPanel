import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import type { TableProps } from "antd";
import { Card, Popconfirm, Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useEffect, useState } from "react";
import type {
  ColumnsType,
  Dictionary,
  DictionaryDetail,
  PageList,
  TableParams,
} from "#/entity";

import dictionaryDetailService from "@/api/services/dictionaryDetailService";
import dictionaryService from "@/api/services/dictionaryService";
import { CardContent, CardHeader } from "@/ui/card";
import { getRandomUserParams, toURLSearchParams } from "@/utils";
import { toast } from "sonner";
import DictionaryDetailModal, {
  type DictionaryDetailModalProps,
} from "./detail-modal";
import DictionaryModal, { type DictionaryModalProps } from "./modal";

const DictionaryDetailList = ({
  selectedDictId,
}: {
  selectedDictId: number | null;
}) => {
  const defaultDictionaryValue: DictionaryDetail = {
    id: 0,
    label: "",
    value: "",
    extend: "",
    status: 2,
    sort: 0,
    sys_dictionary_Id: selectedDictId,
    created_at: "",
    updated_at: "",
  };
  const [data, setData] = useState<PageList<DictionaryDetail>>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: "id",
    sortOrder: "descend",
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [apiModalProps, setDictionaryModalProps] =
    useState<DictionaryDetailModalProps>({
      formValue: { ...defaultDictionaryValue },
      title: "New Dictionary Detail",
      show: false,
      onOk: async (values: DictionaryDetail) => {
        if (values.id === 0) {
          await dictionaryDetailService.createDictionaryDetail(values);
        } else {
          await dictionaryDetailService.updateDictionaryDetail(
            values.id,
            values
          );
        }
        toast.success("success!");
        setDictionaryModalProps((prev) => ({ ...prev, show: false }));
        getData();
      },
      onCancel: () => {
        setDictionaryModalProps((prev) => ({ ...prev, show: false }));
      },
    });

  const getData = useCallback(async () => {
    const params = toURLSearchParams(
      getRandomUserParams(tableParams, (result, searchParams) => {
        if (searchParams) {
          if (searchParams.selectedDictId) {
            result.selectedDictId_match = searchParams.selectedDictId;
          }
        }
      })
    );
    const response = await dictionaryDetailService.searchPageList(
      params.toString()
    );
    setData(response);
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: response.page,
        total: response.total,
        pageSize: response.page_size,
      },
    }));

    setLoading(false);
  }, [tableParams]);

  useEffect(() => {
    setTableParams((prev) => ({
      ...prev,
      searchParams: {
        selectedDictId: selectedDictId || 0,
      },
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
  }, [selectedDictId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setLoading(true);
    getData();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    tableParams?.searchParams?.selectedDictId,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<DictionaryDetail>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData(undefined);
    }
  };

  const onCreate = () => {
    setDictionaryModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultDictionaryValue,
      title: "New Dictionary Detail",
      formValue: { ...defaultDictionaryValue },
    }));
  };

  const onEdit = (formValue: DictionaryDetail) => {
    setDictionaryModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await dictionaryDetailService.deleteDictionaryDetail(id);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const handleDeleteSelection = async () => {
    try {
      await dictionaryDetailService.deleteBatch(selectedRowKeys as number[]);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const columns: ColumnsType<DictionaryDetail> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "展示值",
      dataIndex: "label",
      key: "label",
      ellipsis: true,
    },
    {
      title: "字典值",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "扩展值",
      dataIndex: "extend",
      key: "extend",
    },
    {
      title: "启用状态",
      dataIndex: "status",
      key: "status",
      ellipsis: true,
    },
    {
      title: "排序标记",
      dataIndex: "sort",
      key: "sort",
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
    },

    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
            style={{ minWidth: "70px" }}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:pen-bold-duotone" size={18} />
            <span className="text-xs">修改</span>
          </Button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-row  items-center justify-center gap-1 px-2 py-1 text-error"
            >
              <Icon
                icon="mingcute:delete-2-fill"
                size={18}
                className="text-error!"
              />
              <span className="text-xs">删除</span>
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<DictionaryDetail> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "odd",
        text: "Select Odd Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: "even",
        text: "Select Even Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  const hasSelected = selectedRowKeys.length > 0;
  return (
    <>
      <CardHeader className="p-0">
        <div className="flex items-start justify-start">
          <Button onClick={() => onCreate()} variant="default">
            <Icon icon="solar:add-circle-outline" size={18} />
            New
          </Button>
          <Button
            onClick={() => handleDeleteSelection()}
            variant="ghost"
            className="ml-2"
            disabled={!hasSelected}
          >
            <Icon icon="solar:trash-bin-minimalistic-outline" size={18} />
            Delete
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table<DictionaryDetail>
          rowKey={(record) => record.id}
          rowSelection={rowSelection}
          scroll={{ x: "max-content" }}
          columns={columns}
          pagination={{
            current: tableParams.pagination?.current || 1,
            pageSize: tableParams.pagination?.pageSize || 10,
            total: tableParams?.pagination?.total || 0,
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          dataSource={data?.list}
          loading={loading}
          onChange={handleTableChange}
        />
        <DictionaryDetailModal {...apiModalProps} />
      </CardContent>
    </>
  );
};

const DictionaryList = ({
  onSelect,
}: {
  onSelect?: (id: number | null) => void;
}) => {
  const defaultDictionaryValue: Dictionary = {
    id: 0,
    name: "",
    type: "",
    status: 2,
    desc: "",
    created_at: "",
    updated_at: "",
  };
  const [data, setData] = useState<PageList<Dictionary>>();
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: "id",
    sortOrder: "descend",
  });
  const [apiModalProps, setDictionaryModalProps] =
    useState<DictionaryModalProps>({
      formValue: { ...defaultDictionaryValue },
      title: "New",
      show: false,
      onOk: async (values: Dictionary) => {
        if (values.id === 0) {
          await dictionaryService.createDictionary(values);
        } else {
          await dictionaryService.updateDictionary(values.id, values);
        }
        toast.success("success!");
        setDictionaryModalProps((prev) => ({ ...prev, show: false }));
        getData();
      },
      onCancel: () => {
        setDictionaryModalProps((prev) => ({ ...prev, show: false }));
      },
    });

  const getData = useCallback(async () => {
    const params = toURLSearchParams(getRandomUserParams(tableParams));
    const response = await dictionaryService.searchPageList(params.toString());
    setData(response);
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: response.page,
        total: response.total,
        pageSize: response.page_size,
      },
    }));
    if (response.list.length > 0 && onSelect) {
      onSelect(response.list[0].id);
    }
    setLoading(false);
  }, [tableParams, onSelect]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setLoading(true);
    getData();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange: TableProps<Dictionary>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData(undefined);
    }
  };

  const onCreate = () => {
    setDictionaryModalProps((prev) => ({
      ...prev,
      show: true,
      ...defaultDictionaryValue,
      title: "New",
      formValue: { ...defaultDictionaryValue },
    }));
  };

  const onEdit = (formValue: Dictionary) => {
    setDictionaryModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit",
      formValue,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await dictionaryService.deleteDictionary(id);
      toast.success("删除成功");
      getData();
    } catch (error) {
      console.error(error);
      toast.error("删除失败");
    }
  };

  const columns: ColumnsType<Dictionary> = [
    {
      title: "字典名",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "operation",
      align: "center",
      width: 100,
      render: (_, record) => (
        <div className="flex w-full justify-center text-gray-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
            className="flex flex-row  items-center justify-center gap-1 px-2 py-1"
          >
            <Icon icon="solar:pen-bold-duotone" size={18} />
          </Button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-row  items-center justify-center gap-1 px-2 py-1 text-error"
            >
              <Icon
                icon="mingcute:delete-2-fill"
                size={18}
                className="text-error!"
              />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleRowClick = (record: Dictionary) => {
    setSelectedId(record.id);
    console.log(record.id);

    if (onSelect) {
      onSelect(record.id); // 传递选中的 id
    }
  };

  const rowClassName = (record: Dictionary) => {
    return record.id === selectedId ? "text-primary-foreground" : "";
  };

  return (
    <>
      <CardHeader className="p-0">
        <div className="flex items-start justify-start">
          <Button onClick={() => onCreate()} variant="default">
            <Icon icon="solar:add-circle-outline" size={18} />
            New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table<Dictionary>
          rowKey={(record) => record.id}
          scroll={{ x: "100%" }}
          columns={columns}
          pagination={{
            current: tableParams.pagination?.current || 1,
            pageSize: tableParams.pagination?.pageSize || 10,
            total: tableParams?.pagination?.total || 0,
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          dataSource={data?.list}
          loading={loading}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName={rowClassName}
        />
        <DictionaryModal {...apiModalProps} />
      </CardContent>
    </>
  );
};

const App: React.FC = () => {
  const [selectedDictId, setSelectedDictId] = useState<number | null>(null);

  return (
    <div className="flex w-full gap-4">
      <div className="w-1/4 pr-2">
        <Card title="Dictionary List">
          <DictionaryList onSelect={setSelectedDictId} />
        </Card>
      </div>
      <div className="w-3/4 pl-2">
        <Card title="Dictionary Detail List">
          <DictionaryDetailList selectedDictId={selectedDictId} />
        </Card>
      </div>
    </div>
  );
};

export default App;
