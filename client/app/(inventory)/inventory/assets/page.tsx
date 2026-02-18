"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { inventoryAPI } from "@/lib/inventoryApi";
import type { Asset } from "@/lib/inventoryTypes";
import { Package2, HardDrive, Users, MapPin } from "lucide-react";

type AssetGroup = {
  productId: string;
  productName: string;
  category?: string;
  total: number;
  inStock: number;
  assigned: number;
  underMaintenance: number;
  retired: number;
  locations: string[];
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await inventoryAPI.getAssets();
        setAssets(data || []);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const groups = useMemo<AssetGroup[]>(() => {
    const map = new Map<string, AssetGroup>();

    for (const a of assets) {
      const id = a.product?._id;
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, {
          productId: id,
          productName: a.product?.name || "Unnamed product",
          category: a.product?.category,
          total: 0,
          inStock: 0,
          assigned: 0,
          underMaintenance: 0,
          retired: 0,
          locations: [],
        });
      }

      const g = map.get(id)!;
      g.total += 1;
      if (a.location && !g.locations.includes(a.location)) {
        g.locations.push(a.location);
      }
      switch (a.status) {
        case "IN_STOCK":
          g.inStock += 1;
          break;
        case "ASSIGNED":
          g.assigned += 1;
          break;
        case "UNDER_MAINTENANCE":
          g.underMaintenance += 1;
          break;
        case "RETIRED":
          g.retired += 1;
          break;
      }
    }

    let list = Array.from(map.values());
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((g) => {
        const name = g.productName.toLowerCase();
        const category = g.category?.toLowerCase() ?? "";
        const locations = g.locations.join(" ").toLowerCase();
        return (
          name.includes(q) || category.includes(q) || locations.includes(q)
        );
      });
    }
    // sort by total descending
    return list.sort((a, b) => b.total - a.total);
  }, [assets, search]);

  const totalAssets = assets.length;
  const distinctProducts = groups.length;
  const inStock = assets.filter((a) => a.status === "IN_STOCK").length;
  const assigned = assets.filter((a) => a.status === "ASSIGNED").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Assets</h1>
        <p className="text-muted-foreground">
          Tracked items grouped by product. Click a product to see all its
          assets and details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Assets
            </p>
            <p className="text-xl font-semibold">{totalAssets}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Package2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Products with Assets
            </p>
            <p className="text-xl font-semibold">{distinctProducts}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In Stock
            </p>
            <p className="text-xl font-semibold">{inStock}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Assigned
            </p>
            <p className="text-xl font-semibold">{assigned}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {groups.length} product{groups.length === 1 ? "" : "s"} with tracked
          assets.
        </p>
        <Input
          type="text"
          placeholder="Search by product, category, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {groups.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed bg-muted/40">
          <p className="text-muted-foreground">
            {search
              ? "No asset groups match your search."
              : "No assets found yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Link
              key={g.productId}
              href={`/inventory/assets/${g.productId}`}
              className="group rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md hover:border-blue-500/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold group-hover:text-blue-600">
                    {g.productName}
                  </h2>
                  {g.category && (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {g.category}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">
                  {g.total} asset{g.total === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                  <span className="text-muted-foreground">In Stock</span>
                  <span className="font-semibold">{g.inStock}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
                  <span className="text-muted-foreground">Assigned</span>
                  <span className="font-semibold">{g.assigned}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-muted-foreground">Maintenance</span>
                  <span className="font-semibold">{g.underMaintenance}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-muted-foreground">Retired</span>
                  <span className="font-semibold">{g.retired}</span>
                </div>
              </div>

              {g.locations.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground line-clamp-1">
                  Locations: {g.locations.join(", ")}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

