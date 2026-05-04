"use client";

import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { getDepartments } from "@/app/api";

export type Department = {
  _id: string;
  name: string;
};

type DepartmentsListProps = {
  value: Department | null;
  onSelect: (department: Department) => void;
};

function DepartmentsList({ value, onSelect }: DepartmentsListProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getDepartments(search);
        setDepartments(data.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (value) {
      setSearch(value.name);
    }
  }, [value]);

  /* ---------------- RENDER ---------------- */

  return (
    <Combobox
      items={departments}
      onValueChange={(department) => {
        // if (department) {
        //   onSelect(department);
        //   setSearch(department);
        // }
      }}
    >
      <ComboboxInput placeholder="Select a department" />
      <ComboboxContent>
        <ComboboxEmpty>No departments found.</ComboboxEmpty>
        <ComboboxList>
          {(department) => (
            <ComboboxItem key={department} value={department}>
              {department}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default DepartmentsList;
