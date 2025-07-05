import type { BasicStatus, PermissionType, SortDirection } from "./enum";

export interface PageList<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
  filters: DataFilters;
}

type StringMapOfStringArray = { [key: string]: string[] };
interface DataRangeFilter {
  field: string;
  start: string;
  end: string;
}
interface DataFilters {
  likeFilters: StringMapOfStringArray;
  matches: StringMapOfStringArray;
  dataRanges: DataRangeFilter[] | null;
  sortBy: string[];
  sortDirection: string;
  page: number;
  pageSize: number;
}

export interface UserToken {
  accessToken?: string;
  refreshToken?: string;
  expirationAccessDateTime?: string;
  expirationRefreshDateTime?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  user_name: string;
  nick_name: string;
  header_img: string;
  phone: string;
  status?: boolean;
  created_at: string;
  updated_at: string;
  role?: Role[];
  permissions?: Permission[];
}

export interface UpdateUser {
  email: string;
  user_name: string;
  nick_name: string;
  header_img: string;
  phone: string;
  status?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  status: "enable" | "disable";
  desc?: string;
  order?: number;
  children?: Organization[];
}

export interface Permission {
  id: string;
  parentId: string;
  name: string;
  label: string;
  type: PermissionType;
  route: string;
  status?: BasicStatus;
  order?: number;
  icon?: string;
  component?: string;
  hide?: boolean;
  hideTab?: boolean;
  frameSrc?: URL;
  newFeature?: boolean;
  children?: Permission[];
}

export interface Role {
  id: number;
  parent_id: number;
  name: string;
  label: string;
  status: boolean;
  order?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  default_router: string;
  children?: Role[];
  path: number[];
  // permission?: Permission[];
}

export interface RoleTree {
  value: string;
  title: string;
  key: string;
  children: RoleTree[];
  path: number[];
}

export interface Upload {
  id: string;
  file_name: string;
  file_path: string;
  file_md5: string;
  file_url: string;
}
