"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Package, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inventoryAPI } from "@/lib/inventoryApi";
import { ProcurementBatch } from "@/lib/inventoryTypes";
import { PackageCheck } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcurementBatch[]>([]);
  console.log("🚀 ~ BatchesPage ~ batches:", batches);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const data = await inventoryAPI.getBatches();
      setBatches(data || []);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const awaitingBatches = batches.filter(
    (b) => b.status === "awaiting_receipt" || b.status === "partially_received",
  );
  console.log("🚀 ~ BatchesPage ~ awaitingBatches:", awaitingBatches);

  const statusVariant = (status: string) => {
    if (status === "received") return "default";
    if (status === "partially_received") return "secondary";
    return "outline";
  };

  const tableColumns = [
    { key: "product", label: "Product" },
    { key: "expected", label: "Expected" },
    { key: "received", label: "Received" },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
    { key: "supplier", label: "Supplier" },
  ];
  const tableRows = awaitingBatches.map((batch) => ({
    _id: batch._id,
    product: <span className="font-medium">{batch.product?.name || "—"}</span>,
    expected: batch.expectedQuantity,
    received: batch.receivedQuantity,
    status: (
      <Badge variant={statusVariant(batch.status)}>
        {batch.status.replace("_", " ")}
      </Badge>
    ),
    supplier: batch.supplier?.name || "—",
    location: batch.location || "—",
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receive Goods</h1>
        <p className="text-muted-foreground">
          Receive items from approved procurement batches
        </p>
      </div>

      <DataTable
        title="Batches Awaiting Receipt"
        columns={tableColumns}
        rows={tableRows}
        emptyMessage="No batches awaiting receipt"
        actions={[
          {
            label: "Receive",
            task: (batch) => router.push(`/inventory/batches/${batch}/receive`),
            icon: ArrowLeft,
          },
        ]}
      />
    </div>
  );
}
