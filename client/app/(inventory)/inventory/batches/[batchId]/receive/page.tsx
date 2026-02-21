"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inventoryAPI } from "@/lib/inventoryApi";
import { ProcurementBatch } from "@/lib/inventoryTypes";
import { ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

type AssetMeta = {
  serialNumber: string;
  condition: "NEW" | "GOOD" | "FAIR" | "DAMAGED";
  category: "equipment" | "consumable" | "other";
  ownership: "COMPANY" | "CUSTOMER";
  purchaseDate: string;
  notes: string;
};

const defaultMeta = (): AssetMeta => ({
  serialNumber: "",
  condition: "NEW",
  category: "equipment",
  ownership: "COMPANY",
  purchaseDate: "",
  notes: "",
});

export default function ReceiveBatchPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const batchId = params?.batchId;

  const [batch, setBatch] = useState<ProcurementBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // quantity starts at 0 so it can be used in numeric expressions without 'undefined'
  const [quantity, setQuantity] = useState<number>(0);
  const [assetMetas, setAssetMetas] = useState<AssetMeta[]>([]);

  const remainingToReceive = batch
    ? batch.expectedQuantity - batch.receivedQuantity
    : 0;
  const isAsset = batch?.product?.trackIndividually ?? false;

  useEffect(() => {
    if (!batchId) return;

    const fetchBatch = async () => {
      try {
        const data = await inventoryAPI.getBatchById(batchId);
        setBatch(data);
        // initialize quantity to at least 1, but ensure it's a number
        setQuantity(Math.min(data.expectedQuantity - data.receivedQuantity, 1));
      } catch {
        toast.error("Failed to load batch");
        router.push("/inventory/batches");
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId, router]);

  useEffect(() => {
    if (!isAsset) return;

    setAssetMetas((prev) => {
      if (prev.length === quantity) return prev;
      if (!quantity) return [];
      if (prev.length < quantity) {
        return [
          ...prev,
          ...Array(quantity - prev.length)
            .fill(null)
            .map(defaultMeta),
        ];
      }
      return prev.slice(0, quantity);
    });
  }, [quantity, isAsset]);

  const handleQuantityChange = (val: number) => {
    const qty = Math.max(1, Math.min(remainingToReceive, val));
    setQuantity(qty);
  };

  const updateAssetMeta = <K extends keyof AssetMeta>(
    index: number,
    field: K,
    value: AssetMeta[K],
  ) => {
    setAssetMetas((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    if (!quantity || quantity <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (quantity <= 0 || quantity > remainingToReceive) {
      toast.error(`Quantity must be between 1 and ${remainingToReceive}`);
      return;
    }

    if (isAsset) {
      const missingSerial = assetMetas.some(
        (meta) => !meta.serialNumber.trim(),
      );
      if (missingSerial) {
        toast.error("Serial number is required for all units");
        return;
      }
    }

    setSubmitting(true);
    try {
      await inventoryAPI.receiveBatch(batch._id, {
        quantity,
        ...(isAsset && { assetMetas }),
      });
      toast.success("Batch received successfully");
      router.push("/inventory/batches");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error?.response?.data?.error ?? "Failed to receive batch");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className=" mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory/batches">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Receive Goods
          </h1>
          <p className="text-sm text-muted-foreground">
            {batch.product?.name} • {remainingToReceive} units remaining
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quantity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quantity to Receive</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              max={remainingToReceive}
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseInt(e.target.value) || 0)
              }
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Asset Details */}

        {isAsset && quantity > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Asset Details</CardTitle>
              <CardDescription>
                Enter details for {quantity} unit{quantity > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assetMetas.map((meta, i) => (
                <div
                  key={i}
                  className="space-y-4 pb-6 border-b last:border-0 last:pb-0"
                >
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Unit {i + 1}
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Serial Number *</Label>
                      <Input
                        value={meta.serialNumber}
                        onChange={(e) =>
                          updateAssetMeta(i, "serialNumber", e.target.value)
                        }
                        placeholder="Enter serial number"
                        required
                      />
                    </div>

                    <div>
                      <Label>Condition</Label>
                      <Select
                        value={meta.condition}
                        onValueChange={(v) =>
                          updateAssetMeta(i, "condition", v as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="FAIR">Fair</SelectItem>
                          <SelectItem value="DAMAGED">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select
                        value={meta.category}
                        onValueChange={(v) =>
                          updateAssetMeta(i, "category", v as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Ownership</Label>
                      <Select
                        value={meta.ownership}
                        onValueChange={(v) =>
                          updateAssetMeta(i, "ownership", v as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMPANY">Company</SelectItem>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Purchase Date</Label>
                      <Input
                        type="date"
                        value={meta.purchaseDate}
                        onChange={(e) =>
                          updateAssetMeta(i, "purchaseDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={meta.notes}
                        onChange={(e) =>
                          updateAssetMeta(i, "notes", e.target.value)
                        }
                        placeholder="Optional notes about this unit"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Product:</span>{" "}
              <span className="font-medium">{batch.product?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span>{" "}
              <span className="font-medium">
                {batch.location || "Main Warehouse"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span className="font-medium">
                {isAsset ? "Asset (Tracked)" : "Inventory"}
              </span>
            </div>
            {batch.requisition?.requisitionNumber && (
              <div>
                <span className="text-muted-foreground">Requisition:</span>{" "}
                <span className="font-medium">
                  {batch.requisition.requisitionNumber}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <PackageCheck className="mr-2 h-4 w-4" />
            Receive {quantity} Unit{quantity > 1 ? "s" : ""}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/inventory/batches">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
