import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RequestListCardsProps {
  label: string;
  amount?: number;
  icon?: ReactNode;
  variant?: "default" | "accent" | "warning" | "success" | "danger";
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  active?: boolean;
}

function RequestListCards({
  label,
  amount,
  icon,
  variant = "default",
  onClick,
  className,
  loading = false,
  active = false,
}: RequestListCardsProps) {
  const variantStyles = {
    default: {
      amount: "text-[#1d1d24] dark:text-gray-200",
      dot: "bg-gray-400 dark:bg-gray-500",
    },
    accent: {
      amount: "text-indigo-600 dark:text-indigo-400",
      dot: "bg-indigo-400 dark:bg-indigo-500",
    },
    warning: {
      amount: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-400 dark:bg-amber-500",
    },
    success: {
      amount: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500 dark:bg-emerald-500",
    },
    danger: {
      amount: "text-red-500 dark:text-red-400",
      dot: "bg-red-500 dark:bg-red-500",
    },
  };

  const v = variantStyles[variant];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "bg-white dark:bg-gray-900 border border-[#e0dfe8] dark:border-gray-700 px-4 py-3 cursor-pointer",
        "transition-colors duration-150 hover:bg-[#faf9fc] dark:hover:bg-gray-800",
        "first:rounded-l-md last:rounded-r-md",
        active &&
          "bg-[#f5f3ff] dark:bg-indigo-950/30 border-[#c4b5fd] dark:border-indigo-700",
        className,
      )}
    >
      <p className="text-[11px] text-[#80708f] dark:text-gray-400 uppercase tracking-wide mb-1 truncate">
        {label}
      </p>

      {loading ? (
        <div className="h-5 w-10 rounded  dark:bg-gray-800 animate-pulse mt-0.5" />
      ) : (
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", v.dot)} />
          <span className={cn("text-xl font-semibold font-mono", v.amount)}>
            {amount ?? "—"}
          </span>
        </div>
      )}
    </div>
  );
}

export default RequestListCards;
