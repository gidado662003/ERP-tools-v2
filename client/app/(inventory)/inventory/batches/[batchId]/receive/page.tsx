"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  category: "pop" | "noc" | "cpe" | "other";
  ownership: "COMPANY" | "CUSTOMER";
  purchaseDate: string;
  notes: string;
};

const defaultMeta = (): AssetMeta => ({
  serialNumber: "",
  condition: "NEW",
  category: "pop",
  ownership: "COMPANY",
  purchaseDate: new Date().toISOString().split("T")[0],
  notes: "",
});

const CATEGORY_OPTIONS: {
  value: "pop" | "noc" | "cpe" | "other";
  label: string;
}[] = [
  { value: "pop", label: "POP" },
  { value: "noc", label: "NOC" },
  { value: "cpe", label: "CPE" },
  { value: "other", label: "Other" },
];

export default function ReceiveBatchPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const batchId = params?.batchId;

  const [batch, setBatch] = useState<ProcurementBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [assetMetas, setAssetMetas] = useState<AssetMeta[]>([]);

  const [bulkCategory, setBulkCategory] = useState<
    "pop" | "noc" | "cpe" | "other"
  >("pop");

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
    if (val > remainingToReceive) {
      setQuantity(remainingToReceive);
      return;
    }
    if (val < 0) {
      setQuantity(1);
      return;
    }
    setQuantity(val);
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
    if (quantity > remainingToReceive) {
      toast.error(`Max ${remainingToReceive} units`);
      return;
    }
    if (isAsset && assetMetas.some((m) => !m.serialNumber.trim())) {
      toast.error("Serial number required for all units");
      return;
    }

    setSubmitting(true);
    try {
      await inventoryAPI.receiveBatch(batch._id, {
        quantity,
        ...(isAsset ? { assetMetas } : { category: bulkCategory }),
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
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className=" mx-auto px-4 py-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/inventory/batches">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              Receive Batch
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {batch.product?.name}
              {batch.requisition?.requisitionNumber && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-primary font-medium">
                    #{batch.requisition.requisitionNumber}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="sm"
          className="gap-1.5"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PackageCheck className="h-3.5 w-3.5" />
          )}
          Receive {quantity} Unit{quantity !== 1 ? "s" : ""}
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* ── Left: Main Form ── */}
        <div className="lg:col-span-8 space-y-4">
          {isAsset && quantity > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Individual Units</p>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                  {quantity} total
                </span>
              </div>

              {assetMetas.map((meta, i) => (
                <Card key={i} className="border shadow-none">
                  <CardHeader className="py-3 px-4 border-b bg-muted/40">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Unit #{i + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Serial Number — full width */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Serial Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={meta.serialNumber}
                        onChange={(e) =>
                          updateAssetMeta(i, "serialNumber", e.target.value)
                        }
                        placeholder="e.g. SN-990234"
                        required
                      />
                    </div>

                    {/* 2-col grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <FieldWrap label="Condition">
                        <Select
                          value={meta.condition}
                          onValueChange={(v) =>
                            updateAssetMeta(
                              i,
                              "condition",
                              v as AssetMeta["condition"],
                            )
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
                      </FieldWrap>

                      <FieldWrap label="Category">
                        <Select
                          value={meta.category}
                          onValueChange={(v) =>
                            updateAssetMeta(
                              i,
                              "category",
                              v as AssetMeta["category"],
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldWrap>

                      <FieldWrap label="Ownership">
                        <Select
                          value={meta.ownership}
                          onValueChange={(v) =>
                            updateAssetMeta(
                              i,
                              "ownership",
                              v as AssetMeta["ownership"],
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COMPANY">
                              Company Owned
                            </SelectItem>
                            <SelectItem value="CUSTOMER">
                              Customer Owned
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldWrap>

                      <FieldWrap label="Purchase Date">
                        <Input
                          type="date"
                          value={meta.purchaseDate}
                          onChange={(e) =>
                            updateAssetMeta(i, "purchaseDate", e.target.value)
                          }
                        />
                      </FieldWrap>
                    </div>

                    <FieldWrap label="Notes">
                      <Textarea
                        value={meta.notes}
                        onChange={(e) =>
                          updateAssetMeta(i, "notes", e.target.value)
                        }
                        placeholder="Optional notes for this unit…"
                        className="resize-none"
                        rows={2}
                      />
                    </FieldWrap>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            /* ── Bulk / Non-asset form ── */
            <Card className="border shadow-none">
              <CardHeader className="py-3 px-4 border-b bg-muted/40">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Inventory Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <FieldWrap label="Category">
                  <Select
                    value={bulkCategory}
                    onValueChange={(v) =>
                      setBulkCategory(v as AssetMeta["category"])
                    }
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrap>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Config & Summary ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quantity */}
          <Card className="border shadow-none">
            <CardHeader className="py-3 px-4 border-b bg-muted/40">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="relative">
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={remainingToReceive}
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 0)
                  }
                  className="text-base font-semibold h-10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground pointer-events-none">
                  UNITS
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Max: {remainingToReceive} remaining
              </p>
            </CardContent>
          </Card>

          {/* Batch info */}
          <Card className="border shadow-none bg-muted/30">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Batch Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 divide-y divide-border/50 text-sm">
              <InfoRow label="Product" value={batch.product?.name} />
              <InfoRow
                label="Location"
                value={batch.location || "Main Warehouse"}
              />
              <InfoRow
                label="Tracking"
                value={isAsset ? "Serial tracking" : "Bulk inventory"}
              />
              {batch.requisition?.requisitionNumber && (
                <InfoRow
                  label="Requisition"
                  value={`#${batch.requisition.requisitionNumber}`}
                  accent
                />
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

/* ── Small helpers ── */

function FieldWrap({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between py-2 gap-2">
      <span className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wide shrink-0">
        {label}
      </span>
      <span
        className={`text-xs font-medium text-right ${accent ? "text-primary" : ""}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
