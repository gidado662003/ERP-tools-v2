"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  MoreHorizontal,
  ArrowUpDown,
  AlertTriangle,
  Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────

export type StockCategory =
  | "equipment"
  | "consumable"
  | "pop"
  | "noc"
  | "cpe"
  | "tool"
  | "other";

export type StockItem = {
  _id: string;
  product: {
    _id: string;
    name: string;
    unit: string;
    // suggested additions:
    // sku: string;
    // description: string;
    // imageUrl: string;
  };
  category: StockCategory;
  quantity: number;
  location: string;
  supplier: string | null;
  lastUpdated: string;
  // suggested additions:
  // reorderPoint: number;       — threshold to flag low stock
  // reorderQuantity: number;    — how much to reorder
  // unitCost: number;           — for stock valuation
  // totalValue: number;         — quantity * unitCost (computed)
  // warehouseZone: string;      — shelf/bin location within a warehouse
  // lastReceivedAt: string;     — last batch received date
  // lastDispatchedAt: string;   — last time stock was consumed/dispatched
};

// ── Helpers ────────────────────────────────────────────────────────────────

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

// Low stock threshold — ideally this comes from reorderPoint on the item
const LOW_STOCK_THRESHOLD = 5;

function isLowStock(item: StockItem) {
  return item.quantity <= LOW_STOCK_THRESHOLD;
}

function QuantityCell({ item }: { item: StockItem }) {
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

// ── Component ──────────────────────────────────────────────────────────────

function StockList({ inventoryData }: { inventoryData: StockItem[] }) {
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
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[260px]">
                Product
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-1">
                  Quantity
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Location
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last Updated
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow
                key={item._id}
                className={`text-sm ${isLowStock(item) ? "bg-amber-50/40 hover:bg-amber-50/60" : ""}`}
              >
                <TableCell>
                  <div>
                    <p className="font-medium leading-tight">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {item.product._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other
                    }`}
                  >
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                </TableCell>

                <TableCell>
                  <QuantityCell item={item} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="text-xs">{item.location}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.lastUpdated), {
                      addSuffix: true,
                    })}
                  </span>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-sm">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/inventory/stock/${item._id}`)
                        }
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/inventory/stock/${item._id}/adjust-quantity`,
                          )
                        }
                      >
                        Adjust Quantity
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/inventory/stock/${item._id}/transfer-location`,
                          )
                        }
                      >
                        Transfer Location
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Stat strip helper ──────────────────────────────────────────────────────

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
