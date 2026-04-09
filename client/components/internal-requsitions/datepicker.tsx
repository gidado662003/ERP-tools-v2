import React, { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  onDateChange?: (startDate: string, endDate: string) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateChange,
  className,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    onDateChange?.(value, endDate);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    onDateChange?.(startDate, value);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onDateChange?.("", "");
  };

  const fmt = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  const hasRange = startDate && endDate;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <CalendarDays
        size={13}
        className="text-[#80708f] dark:text-gray-400 shrink-0"
      />

      <div className="flex items-center gap-px bg-[#e0dfe8] dark:bg-gray-700 rounded-md overflow-hidden border border-[#e0dfe8] dark:border-gray-700">
        <input
          type="date"
          value={startDate}
          onChange={handleStartChange}
          max={endDate || undefined}
          className={cn(
            "px-3 w-[50%] py-1.5 text-xs bg-white dark:bg-gray-900 text-[#1d1d24] dark:text-gray-200",
            "border-0 outline-none cursor-pointer",
            "hover:bg-[#faf9fc] dark:hover:bg-gray-800 transition-colors duration-150",
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "placeholder:text-[#80708f] dark:placeholder:text-gray-500",
          )}
          placeholder="Start date"
        />
        <span className="text-[11px] text-[#80708f] dark:text-gray-400 px-1.5 bg-white dark:bg-gray-900 border-x border-[#e0dfe8] dark:border-gray-700 py-1.5 select-none">
          to
        </span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndChange}
          min={startDate || undefined}
          className={cn(
            "px-5 py-1.5 w-[50%]  text-xs bg-white dark:bg-gray-900 text-[#1d1d24] dark:text-gray-200",
            "border-0 outline-none cursor-pointer",
            "hover:bg-[#faf9fc] dark:hover:bg-gray-800 transition-colors duration-150",
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "placeholder:text-[#80708f] dark:placeholder:text-gray-500",
          )}
          placeholder="End date"
        />
      </div>

      {hasRange && (
        <>
          <span className="text-[11px] text-[#80708f] dark:text-gray-400">
            {fmt(startDate)} — {fmt(endDate)}
          </span>
          <button
            onClick={handleClear}
            className="flex items-center justify-center w-4 h-4 rounded-sm text-[#80708f] dark:text-gray-400 hover:text-[#1d1d24] dark:hover:text-gray-200 hover:bg-[#f0eef5] dark:hover:bg-gray-800 transition-colors"
          >
            <X size={11} />
          </button>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
