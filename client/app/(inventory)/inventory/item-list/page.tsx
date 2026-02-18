"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { inventoryAPI } from "@/lib/inventoryApi";
import { InventoryItem } from "@/lib/inventoryTypes";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDate } from "@/helper/dateFormat";

export default function InventoryItemListPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await inventoryAPI.getInventory();
        setInventory(data || []);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    if (!search.trim()) return inventory;
    const q = search.toLowerCase().trim();
    return inventory.filter(
      (item) =>
        item.product?.name?.toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const tableData = filteredInventory.map((item) => ({
    productName: (
      <span className="font-medium">{item.product?.name || "—"}</span>
    ),
    category: (
      <span className="capitalize">
        {item.product?.category || "—"}
      </span>
    ),
    unit: item.product?.unit || "pcs",
    quantity: <span className="font-semibold">{item.quantity}</span>,
    location: item.location || "Main Warehouse",
    lastUpdated: (
      <span className="text-muted-foreground">
        {formatDate(item.lastUpdated)}
      </span>
    ),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Items</h1>
        <p className="text-muted-foreground">
          Search and view all inventory items
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          type="text"
          placeholder="Search by product name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4">
          <DataTable
            columns={[
              { key: "productName", label: "Product" },
              { key: "category", label: "Category" },
              { key: "unit", label: "Unit" },
              { key: "quantity", label: "Quantity" },
              { key: "location", label: "Location" },
              { key: "lastUpdated", label: "Last Updated" },
            ]}
            data={tableData}
            getRowKey={(_, i) => filteredInventory[i]?._id ?? i}
            emptyMessage={
              search ? "No items match your search" : "No inventory items found"
            }
            striped
          />
        </div>
      </div>
    </div>
  );
}
