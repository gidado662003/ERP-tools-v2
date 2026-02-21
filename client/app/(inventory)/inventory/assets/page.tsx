"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { inventoryAPI } from "@/lib/inventoryApi";
import { Package2, Users, MapPin } from "lucide-react";

import type { AssetGroup } from "@/lib/inventoryTypes";

export default function AssetsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<AssetGroup[]>([]);
  const [searchLoad, setSearchLoad] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setSearchLoad(true);
        const data = await inventoryAPI.getAssetsSummary({ search });
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch assets summary:", err);
      } finally {
        setLoading(false);
        setSearchLoad(false);
      }
    };
    fetchAssets();
  }, [search]);

  const distinctProducts = groups.length;
  const inStock = groups.reduce((acc, g) => acc + g.inStock, 0);
  const assigned = groups.reduce((acc, g) => acc + g.assigned, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Package2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Products
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
          {searchLoad
            ? "Searching..."
            : `${groups.length} product${groups.length === 1 ? "" : "s"} with tracked assets.`}
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
