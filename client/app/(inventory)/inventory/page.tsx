"use client";

import React, { useEffect, useState } from "react";
import { Package, Boxes, MapPin, AlertTriangle } from "lucide-react";
import RequestListCards from "@/components/internal-requsitions/card";
import { inventoryAPI } from "@/lib/inventoryApi";
import { InventoryItem } from "@/lib/inventoryTypes";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDate } from "@/helper/dateFormat";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryDashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueLocations = new Set(
    inventory.map((i) => i.location || "N/A")
  ).size;
  const lowStockCount = inventory.filter(
    (i) => i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD
  ).length;

  const tableData = inventory.map((item) => ({
    productName: (
      <span className="font-medium">{item.product?.name || "—"}</span>
    ),
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
        <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your inventory items and stock levels
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RequestListCards
          label="Total Items"
          amount={totalItems}
          icon={<Package size={24} />}
          variant="accent"
        />
        <RequestListCards
          label="Total Quantity"
          amount={totalQuantity}
          icon={<Boxes size={24} />}
          variant="default"
        />
        <RequestListCards
          label="Locations"
          amount={uniqueLocations}
          icon={<MapPin size={24} />}
          variant="success"
        />
        <RequestListCards
          label="Low Stock"
          amount={lowStockCount}
          icon={<AlertTriangle size={24} />}
          variant="warning"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Inventory Summary</h2>
          <p className="text-sm text-muted-foreground">
            All stocked items across locations
          </p>
        </div>
        <div className="p-4">
          <DataTable
            columns={[
              { key: "productName", label: "Product" },
              { key: "quantity", label: "Quantity" },
              { key: "location", label: "Location" },
              { key: "lastUpdated", label: "Last Updated" },
            ]}
            data={tableData}
            getRowKey={(_, i) => inventory[i]?._id ?? i}
            emptyMessage="No inventory items found"
            striped
          />
        </div>
      </div>
    </div>
  );
}
