"use client";
import React, { useEffect, useState } from "react";
import { inventoryAPI } from "@/lib/inventoryApi";
import { Supplier } from "@/lib/inventoryTypes";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <div className="bg-white dark:bg-[#1a1523] border border-[#e0dfe8] dark:border-[#2b2233] rounded-[8px] overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e0dfe8] dark:border-[#2b2233] flex items-center gap-3">
        <div className="w-9 h-9 rounded-[6px] bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-[12px] font-semibold text-violet-700 dark:text-violet-300 flex-shrink-0">
          {getInitials(supplier.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#1d1d24] dark:text-[#d4cce0] truncate">
            {supplier.name}
          </p>
          <p className="text-[11px] text-[#80708f] dark:text-[#6b5c7a]">
            {supplier.itemsSupplied || 0} product
            {supplier.itemsSupplied !== 1 ? "s" : ""} supplied
          </p>
        </div>
      </div>

      <div className="px-4 py-1">
        {supplier.contact || supplier.email ? (
          <div className="grid grid-cols-2">
            {supplier.contact && (
              <div className="py-2.5 border-b border-[#f0eef5] dark:border-[#211929]">
                <p className="text-[10px] uppercase tracking-widest text-[#998da8] dark:text-[#5c4f6b] mb-1">
                  Contact
                </p>
                <p className="text-[12px] text-[#1d1d24] dark:text-[#d4cce0]">
                  {supplier.contact}
                </p>
              </div>
            )}

            {supplier.email && (
              <div
                className={`py-2.5 ${supplier.contact ? "pl-4" : ""} border-b border-[#f0eef5] dark:border-[#211929]`}
              >
                <p className="text-[10px] uppercase tracking-widest text-[#998da8] dark:text-[#5c4f6b] mb-1">
                  Email
                </p>
                <p className="text-[12px] text-[#1d1d24] dark:text-[#d4cce0] truncate font-mono">
                  {supplier.email}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2.5 text-center border-b border-[#f0eef5] dark:border-[#211929]">
            <p className="text-[11px] text-[#80708f] dark:text-[#5c4f6b] italic">
              No contact info
            </p>
          </div>
        )}

        <div className="py-2.5 flex justify-between items-center">
          <div></div>
          {supplier.createdAt && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-[#998da8] dark:text-[#5c4f6b] mb-1">
                Added
              </p>
              <p className="text-[11px] text-[#80708f] dark:text-[#6b5c7a]">
                {formatDate(supplier.createdAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function handleGetSuppliers() {
      try {
        const data = await inventoryAPI.getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    handleGetSuppliers();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1a1523] border border-[#e0dfe8] dark:border-[#2b2233] rounded-[8px] p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[6px] bg-[#e0dfe8] dark:bg-[#2b2233]" />
              <div className="flex-1">
                <div className="h-3 bg-[#e0dfe8] dark:bg-[#2b2233] rounded w-32 mb-1" />
                <div className="h-2 bg-[#e0dfe8] dark:bg-[#2b2233] rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!suppliers.length) {
    return (
      <div className="text-center py-8">
        <p className="text-[13px] text-[#80708f] dark:text-[#5c4f6b]">
          No suppliers found.
        </p>
      </div>
    );
  }

  const supplierCount = suppliers.length;

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-[13px] bg-white dark:bg-[#1a1523] border border-[#e0dfe8] dark:border-[#2b2233] rounded-[6px] focus:outline-none focus:border-violet-400 dark:focus:border-violet-600 placeholder:text-[#80708f] dark:placeholder:text-[#5c4f6b]"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80708f] hover:text-[#1d1d24] dark:hover:text-[#d4cce0] text-[12px]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-[11px] text-[#80708f] dark:text-[#5c4f6b] px-1">
        {supplierCount} supplier{supplierCount !== 1 ? "s" : ""}
      </p>

      {/* Supplier grid */}
      {supplierCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier._id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[13px] text-[#80708f] dark:text-[#5c4f6b]">
            No suppliers matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};
