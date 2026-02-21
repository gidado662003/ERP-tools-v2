"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { EmployeeDTO } from "@/lib/inventoryTypes";

type EmployeeComboboxProps = {
  employees: EmployeeDTO[];
  value: EmployeeDTO | null;
  onSelect: (employee: EmployeeDTO) => void;
  onSearch?: (search: string) => void;
  disabled?: boolean;
  hasError?: boolean;
};

function EmployeeCombobox({
  employees,
  value,
  onSelect,
  onSearch,
  disabled,
  hasError,
}: EmployeeComboboxProps) {
  const [search, setSearch] = useState(value?.name ?? "");

  return (
    <Combobox<EmployeeDTO>
      items={employees}
      itemToStringValue={(e) => e?.name ?? ""}
      onValueChange={(e) => {
        if (e) {
          onSelect(e);
          setSearch(e.name);
          onSearch?.(e.name);
        }
      }}
    >
      <ComboboxInput
        placeholder="Search by name or department…"
        value={search}
        onChange={(ev) => {
          const val = ev.target.value;
          setSearch(val);
          onSearch?.(val);
        }}
        disabled={disabled}
        className={`w-full ${hasError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
      />

      <ComboboxContent className="w-full">
        <ComboboxEmpty>
          <p className="text-sm text-muted-foreground p-2">No employee found</p>
        </ComboboxEmpty>

        <ComboboxList>
          {(e: EmployeeDTO) => (
            <ComboboxItem key={e.id} value={e}>
              <div className="flex flex-col py-0.5">
                <span className="font-medium text-sm">{e.name}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default EmployeeCombobox;
