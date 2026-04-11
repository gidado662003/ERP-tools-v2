import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export type TableColumn = {
  _id?: string;
  key: string;
  label: string;
  className?: string;
};

export type TableRowData = {
  [key: string]: React.ReactNode;
};

export interface Action {
  icon: React.ElementType;
  task: (row: any) => void;
  color?: string;
  label: string;
}
export interface DataTableProps {
  columns: TableColumn[];
  rows: TableRowData[];
  emptyMessage?: string;
  striped?: boolean;
  title: string;
  actions?: Action[];
}

export function DataTable({
  columns,
  rows,
  title,
  emptyMessage = "No data available",
  striped = false,
  actions,
}: DataTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e0dfe8] dark:border-gray-700">
        <p className="text-xs font-medium text-[#80708f] dark:text-gray-400 uppercase tracking-wide">
          {title}
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e0dfe8] dark:border-gray-700">
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2 text-left text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide font-medium"
              >
                {c.label}
              </th>
            ))}
            <th className="text-right pr-2">
              {" "}
              {actions?.length && actions?.length > 0 && <>Actions</>}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows?.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#f0eef5] dark:border-gray-800 hover:bg-[#faf9fc] dark:hover:bg-gray-800/50 transition-colors last:border-0"
            >
              {columns.map((c) => (
                <>
                  <td
                    key={c.key}
                    className="px-4 py-2.5 text-[#1d1d24] dark:text-gray-200 font-mono"
                  >
                    {row[c.key]}
                  </td>
                </>
              ))}
              <td>
                {actions?.length && actions?.length > 0 && (
                  <div className="flex cursor-pointer pr-3 items-center justify-end gap-2">
                    {actions.map((items, index) => {
                      const Icon = items.icon;
                      return (
                        <Tooltip>
                          <TooltipTrigger>
                            <button
                              key={index}
                              className={`p-1 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${items.color}`}
                              onClick={() => items.task(row._id)}
                            >
                              <Icon />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{items.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
