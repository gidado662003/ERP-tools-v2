"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inventoryAPI } from "@/lib/inventoryApi";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Supplier {
  _id: string;
  name: string;
  slug: string;
  contactInfo: { email: string; phone: string; address: string };
  itemsSupplied: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  console.log("🚀 ~ SupplierList ~ suppliers:", suppliers);
  const [data, setData] = useState(suppliers);
  //   const [loading, setLoading] = useState(true);
  const router = useRouter();
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium tracking-widest uppercase text-zinc-400">
          Suppliers
        </span>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
          {data?.length} total
        </span>
      </div>
      <div className="flex  justify-between gap-2.5 ">
        <Input placeholder="Search suppliers..." className="mb-4" />
        <Button className="bg-blue-400 hover:bg-blue-600 text-white">
          Search
        </Button>
      </div>

      <div className="border-t border-zinc-100 mb-4" />

      <div className="grid lg:grid-cols-3 grid-cols-1 gap-2.5">
        {data.length === 0 ? (
          <p className="text-sm font-mono text-zinc-400 text-center py-8">
            No suppliers found
          </p>
        ) : (
          data.map((supplier) => (
            <div
              onClick={() => {
                // window.location.href = `/inventory/suppliers/${supplier.slug}-${supplier._id}`;
                router.push(
                  `/inventory/suppliers/${supplier.slug}-${supplier._id}`,
                );
              }}
              key={supplier._id}
              className="flex cursor-pointer items-center gap-4 px-5 py-4 rounded-xl bg-white border border-zinc-200 hover:border-blue-200 hover:ring-2 hover:ring-blue-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-sm font-mono font-medium flex-shrink-0">
                {getInitials(supplier.name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate capitalize">
                  {supplier.name.toLowerCase()}
                </p>
                <p className="text-xs font-mono text-zinc-400 truncate">
                  {supplier.contactInfo?.email}
                </p>
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                  Supplied
                </span>
                <span className="text-lg font-mono font-medium text-zinc-800 leading-none">
                  {supplier.itemsSupplied}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
