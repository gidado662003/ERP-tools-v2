"use client";

import { materialRequestAPI } from "@/lib/material-request/material-requestApi";
import { inventoryAPI } from "@/lib/inventoryApi";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  Trash2,
  PackageSearch,
  X,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { RequestLine } from "@/lib/material-request/material-requestType";
import { InventoryItem } from "@/lib/inventoryTypes";
import { toast } from "sonner";

export default function CreateRequest() {
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<RequestLine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [InventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inventoryAPI
      .getInventory()
      .then(setInventoryItems)
      .catch(() => toast.error("Failed to load stock"))
      .finally(() => setStockLoading(false));
  }, []);

  useEffect(() => {
    if (panelOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [panelOpen]);

  const filtered = InventoryItems.filter((s) =>
    s.product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const isAdded = (id: string) => lines.some((l) => l.inventory === id);

  const addLine = (item: InventoryItem) => {
    if (isAdded(item._id)) {
      toast.info(`${item.product.name} already added`);
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        inventory: item._id,
        product: item.product._id,
        productName: item.product.name,
        unit: item.product.unit,
        availableQty: item.quantity,
        location: item.location,
        quantity: 1,
      },
    ]);
    setPanelOpen(false);
    setSearch("");
  };

  const removeLine = (i: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== i));

  const updateQty = (i: number, val: number) =>
    setLines((prev) => {
      const next = [...prev];
      next[i] = {
        ...next[i],
        quantity: Math.max(
          1,
          Math.min(val || 1, next[i].availableQty as number),
        ),
      };
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length) {
      toast.error("Add at least one item");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    setSubmitting(true);
    try {
      await materialRequestAPI.createMaterialRequest({
        reason,
        items: lines.map(({ inventory, product, quantity, unit }) => ({
          inventory,
          product,
          quantity,
          unit,
        })),
      });
      toast.success("Request submitted");
      router.push("/inventory/material-request");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error?.response?.data?.error ?? "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=" mx-auto  space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/inventory/material-requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-base font-semibold">New Material Request</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select stock items and submit for approval
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !lines.length || !reason.trim()}
          size="sm"
          className="gap-1.5"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PackageSearch className="h-3.5 w-3.5" />
          )}
          Submit Request
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* ── Left: Items ── */}
        <div className="lg:col-span-8 space-y-3">
          {/* Row: label + toggle button */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Items
              {lines.length > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                  · {lines.length}
                </span>
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setPanelOpen((p) => !p)}
            >
              {panelOpen ? (
                <>
                  <X className="h-3 w-3" /> Close
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Add Item
                </>
              )}
            </Button>
          </div>

          {/* Browse panel */}
          {panelOpen && (
            <Card className="border shadow-none">
              <CardHeader className="py-3 px-4 border-b bg-muted/40">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Browse Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product name…"
                    className="pl-8 h-8 text-sm"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto divide-y border rounded-md">
                  {stockLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      No results
                    </p>
                  ) : (
                    filtered.map((item) => {
                      const added = isAdded(item._id);
                      const low = item.quantity > 0 && item.quantity <= 5;
                      const empty = item.quantity === 0;
                      return (
                        <button
                          key={item._id}
                          type="button"
                          disabled={added || empty}
                          onClick={() => addLine(item)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {item.product.name}
                            </p>
                            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground mt-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {item.location}
                            </span>
                          </div>
                          <div className="shrink-0 ml-4 text-right">
                            {added ? (
                              <span className="text-[10px] font-semibold text-primary">
                                Added
                              </span>
                            ) : empty ? (
                              <span className="text-[10px] font-semibold text-destructive">
                                Out of stock
                              </span>
                            ) : (
                              <span
                                className={`flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${low ? "text-amber-600" : "text-muted-foreground"}`}
                              >
                                {low && (
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                )}
                                {item.quantity} {item.product.unit}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lines list */}
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-md text-center gap-1.5">
              <PackageSearch className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No items added</p>
              <p className="text-xs text-muted-foreground/70">
                Use Add Item to pick from stock
              </p>
            </div>
          ) : (
            <Card className="border shadow-none">
              <CardHeader className="py-3 px-4 border-b bg-muted/40">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Requested Items
                </CardTitle>
              </CardHeader>
              <div className="divide-y">
                {lines.map((line, i) => (
                  <div
                    key={line.inventory}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {line.productName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        {line.location}
                        <span className="mx-0.5">·</span>
                        {line.availableQty} {line.unit} available
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Input
                        type="number"
                        min={1}
                        max={line.availableQty}
                        value={line.quantity}
                        onChange={(e) =>
                          updateQty(i, parseInt(e.target.value) || 1)
                        }
                        className="w-16 h-7 text-sm text-center tabular-nums px-1"
                      />
                      <span className="text-xs text-muted-foreground w-6 shrink-0">
                        {line.unit}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeLine(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: Reason + Summary ── */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-none">
            <CardHeader className="py-3 px-4 border-b bg-muted/40">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reason <span className="text-destructive">*</span>
                <p className="text-[5px] text-muted-foreground mt-1">
                  Please provide a brief explanation for this material request.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Installation at customer site — Lagos Island"
                className="resize-none text-sm"
                rows={4}
                required
              />
            </CardContent>
          </Card>

          {lines.length > 0 && (
            <Card className="border shadow-none bg-muted/30">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 divide-y divide-border/50">
                <SummaryRow label="Items" value={String(lines.length)} />
                <SummaryRow
                  label="Total Units"
                  value={String(lines.reduce((s, l) => s + l.quantity, 0))}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-2">
      <span className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-medium tabular-nums">{value}</span>
    </div>
  );
}
