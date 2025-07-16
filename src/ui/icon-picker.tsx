import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { CommandInput, CommandGroup, CommandItem } from "@/ui/command";
import { useEffect, useRef, useState } from "react";

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Lucide 图标列表（已简化）
  const icons = [
    "activity",
    "airplay",
    "alert-circle",
    "align-center",
    "anchor",
    "aperture",
    "archive",
    "arrow-down",
    "arrow-up",
    "at-sign",
    "award",
    "bar-chart",
    // ...其他图标
  ];

  // 筛选图标
  const filteredIcons = search
    ? icons.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()))
    : icons;

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block w-full max-w-xs">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 truncate">
          <Icon icon={value || "solar:document-bold"} size={18} />
          <span>{value || "Select Icon"}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </Button>

      {/* 手动实现的弹窗 */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-white p-2 shadow-lg"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          <CommandInput
            placeholder="Search icon..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandGroup>
            {filteredIcons.length === 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                No icon found.
              </div>
            ) : (
              filteredIcons.map((icon) => (
                <CommandItem
                  key={icon}
                  onSelect={() => {
                    onChange(icon);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-gray-100"
                >
                  <Icon icon={icon} size={16} />
                  <span>{icon}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
