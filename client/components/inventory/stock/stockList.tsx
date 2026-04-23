"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  MoreHorizontal,
  ArrowUpDown,
  AlertTriangle,
  Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { InventoryItem } from "@/lib/inventoryTypes";
import { DataTable } from "@/components/dashboard/data-table";

export type StockCategory =
  | "equipment"
  | "consumable"
  | "pop"
  | "noc"
  | "cpe"
  | "tool"
  | "other";

const CATEGORY_LABELS: Record<StockCategory, string> = {
  equipment: "Equipment",
  consumable: "Consumable",
  pop: "POP",
  noc: "NOC",
  cpe: "CPE",
  tool: "Tool",
  other: "Other",
};

const CATEGORY_COLORS: Record<StockCategory, string> = {
  equipment: "bg-blue-50 text-blue-700 border-blue-200",
  consumable: "bg-amber-50 text-amber-700 border-amber-200",
  pop: "bg-violet-50 text-violet-700 border-violet-200",
  noc: "bg-cyan-50 text-cyan-700 border-cyan-200",
  cpe: "bg-emerald-50 text-emerald-700 border-emerald-200",
  tool: "bg-orange-50 text-orange-700 border-orange-200",
  other: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const LOW_STOCK_THRESHOLD = 5;

function isLowStock(item: InventoryItem) {
  return item.quantity <= LOW_STOCK_THRESHOLD;
}

function QuantityCell({ item }: { item: InventoryItem }) {
  const low = isLowStock(item);

  return (
    <div className="flex items-center gap-1.5">
      {low && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />}
      <span
        className={`tabular-nums font-medium text-sm ${low ? "text-amber-600" : ""}`}
      >
        {item.quantity.toLocaleString()}
      </span>
      <span className="text-xs text-muted-foreground">{item.product.unit}</span>
    </div>
  );
}

function StockList({ inventoryData }: { inventoryData: InventoryItem[] }) {
  const router = useRouter();
  if (!inventoryData?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-md">
        <Package className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          No stock items found
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Receive a batch to add stock
        </p>
      </div>
    );
  }

  const lowStockCount = inventoryData.filter(isLowStock).length;

  const rows = inventoryData.map((item) => ({
    id: item._id,
    product: (
      <div>
        <p className="font-medium leading-tight">{item.product.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
          {item.product._id.slice(-8).toUpperCase()}
        </p>
      </div>
    ),
    category: (
      <span
        className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other
        }`}
      >
        {CATEGORY_LABELS[item.category] ?? item.category}
      </span>
    ),
    quantity: <QuantityCell item={item} />,
    location: (
      <div className="flex items-center gap-1 text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="text-xs">{item.location}</span>
      </div>
    ),
    lastUpdated: formatDistanceToNow(new Date(item.lastUpdated), {
      addSuffix: true,
    }),
  }));
  const columns = [
    { key: "product", label: "Product" },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Quantity" },
    { key: "location", label: "Location" },
    { key: "lastUpdated", label: "Last Updated" },
  ];
  const actions = [
    {
      label: "View Details",
      task: (id: string) => router.push(`/inventory/stock/${id}`),
      icon: MoreHorizontal,
      color: "text-gray-600 hover:text-gray-900",
    },
    {
      label: "Adjust Quantity",
      task: (id: string) =>
        router.push(`/inventory/stock/${id}/adjust-quantity`),
      icon: ArrowUpDown,
      color: "text-green-600 hover:text-green-900",
    },
    {
      label: "Transfer Location",
      task: (id: string) =>
        router.push(`/inventory/stock/${id}/transfer-location`),
      icon: MapPin,
      color: "text-blue-600 hover:text-blue-900",
    },
  ];

  return (
    <div className="space-y-3">
      {/* ── Strip stats ── */}
      <div className="flex items-center gap-6 px-1">
        <Stat label="Total Items" value={inventoryData.length} />
        <Stat
          label="Total Units"
          value={inventoryData
            .reduce((s, i) => s + i.quantity, 0)
            .toLocaleString()}
        />
        {lowStockCount > 0 && (
          <Stat label="Low Stock" value={lowStockCount} accent="warning" />
        )}
      </div>

      {/* ── Table ── */}
      <div className="border rounded-md overflow-hidden">
        <DataTable
          title="Stock Inventory"
          columns={columns}
          rows={rows}
          actions={actions}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "warning";
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={`text-sm font-semibold tabular-nums ${
          accent === "warning" ? "text-amber-600" : ""
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default StockList;
