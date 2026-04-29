"use client";
import React, { useState } from "react";
import UserSelect from "@/components/userSelect";
import { Textarea } from "@/components/ui/textarea";
function page() {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const handleChange = (e: any) => {
    const value = e.target.value;
    setInputValue(value);

    const match = value.match(/@(\w*)$/);

    if (match) {
      const query = match[1];
      setSearch(query);
    }
  };
  return (
    <div>
      <Textarea
        value={inputValue}
        onChange={handleChange}
        placeholder="Search users..."
        className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <UserSelect search={search} />
    </div>
  );
}

export default page;
