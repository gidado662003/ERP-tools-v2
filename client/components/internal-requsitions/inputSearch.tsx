import React, { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputSearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

const InputSearch: React.FC<InputSearchProps> = ({
  placeholder = "Search...",
  onSearch,
  className,
}) => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="">
      <div className={cn("relative", className)}>
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#80708f] pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "w-[260px] pl-8 pr-3 py-1.5 text-xs",
            "bg-white dark:bg-black dark:text-white border border-[#e0dfe8] rounded-md",
            "text-[#1d1d24] placeholder:text-[#80708f]",
            "transition-colors duration-150",
            "hover:border-[#c8c6d4]",
            "focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]",
          )}
        />
      </div>
    </div>
  );
};

export default InputSearch;
