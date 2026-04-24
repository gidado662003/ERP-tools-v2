"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Package2, Users, MapPin, Search } from "lucide-react";
import type { AssetGroup } from "@/lib/inventoryTypes";

export default function AssetsPage({ groups }: { groups: AssetGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const distinctProducts = groups.length;
  const inStock = groups.reduce((acc, g) => acc + g.inStock, 0);
  const assigned = groups.reduce((acc, g) => acc + g.assigned, 0);

  return (
    <div className="space-y-5">
      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-md overflow-hidden bg-background">
        {[
          {
            icon: <Package2 className="h-3.5 w-3.5" />,
            label: "Total Products",
            value: distinctProducts,
            iconCls: "bg-emerald-50 text-emerald-700",
          },
          {
            icon: <MapPin className="h-3.5 w-3.5" />,
            label: "In Stock",
            value: inStock,
            iconCls: "bg-blue-50 text-blue-700",
          },
          {
            icon: <Users className="h-3.5 w-3.5" />,
            label: "Assigned",
            value: assigned,
            iconCls: "bg-amber-50 text-amber-700",
          },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 px-4 py-3.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded ${s.iconCls}`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <p className="text-lg font-semibold leading-none mt-0.5">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {groups.length} product{groups.length === 1 ? "" : "s"} with tracked
          assets.
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product, category, or location…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilter("search", e.target.value);
            }}
            className="h-8 w-64 rounded border border-border bg-background pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {groups.length === 0 ? (
        <div className="flex items-center justify-center min-h-[160px] rounded-md border border-dashed">
          <p className="text-xs text-muted-foreground">
            {search
              ? "No asset groups match your search."
              : "No assets found yet."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden divide-y divide-border bg-background">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 divide-x-0 md:divide-x divide-border">
            {groups.map((g) => (
              <Link
                key={g.productId}
                href={`/inventory/assets/${g.productId}`}
                className="group relative flex flex-col gap-2.5 p-4 hover:bg-[#f8f9fb] dark:hover:bg-[#2d3748] transition-colors border-b border-border last:border-b-0"
              >
                {/* left accent */}
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-violet-500 transition-colors rounded-l-md" />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold leading-snug group-hover:text-violet-600 transition-colors">
                      {g.productName}
                    </p>
                    {g.category && (
                      <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground mt-0.5">
                        {g.category}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">
                    {g.total} asset{g.total === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {[
                    {
                      label: "In Stock",
                      value: g.inStock,
                      cls: "text-emerald-700",
                    },
                    {
                      label: "Assigned",
                      value: g.assigned,
                      cls: "text-blue-700",
                    },
                    {
                      label: "Maintenance",
                      value: g.underMaintenance,
                      cls: "text-amber-700",
                    },
                    {
                      label: "Retired",
                      value: g.retired,
                      cls: "text-muted-foreground",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex gap-2 items-center justify-between rounded bg-muted/50 px-2.5 py-1.5"
                    >
                      <span className="text-[11px] text-muted-foreground">
                        {s.label}
                      </span>
                      <span className={`text-xs font-semibold ${s.cls}`}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {g.locations.length > 0 && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {g.locations.join(", ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
