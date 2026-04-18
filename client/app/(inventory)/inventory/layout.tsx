"use client";
import React from "react";
import InventorySidebar from "@/components/inventory/inventory-app-sidebar";
import IconRailSidebar from "@/components/railSidebar";
import {
  LayoutDashboard,
  Package,
  Tag,
  PackageCheck,
  ArrowLeftRight,
} from "lucide-react";

import Link from "next/link";

function InventoryLayout({ children }: { children: React.ReactNode }) {
  const inventoryItems = [
    {
      href: "/inventory",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/inventory/item-list",
      label: "Items",
      icon: Package,
      data: [
        { label: "All Items", href: "/inventory/item-list" },
        { label: "Add Item", href: "/inventory/item-list/create" },
        { label: "Categories", href: "/inventory/item-list/categories" },
      ],
    },
    {
      href: "/inventory/assets",
      label: "Assets",
      icon: Tag,
      data: [
        { label: "All Assets", href: "/inventory/assets" },
        { label: "Asset Types", href: "/inventory/assets/types" },
        { label: "Assigned Assets", href: "/inventory/assets/assigned" },
      ],
    },
    {
      href: "/inventory/batches",
      label: "Receive Goods",
      icon: PackageCheck,
      data: [
        { label: "All Batches", href: "/inventory/batches" },
        { label: "New Batch", href: "/inventory/batches/create" },
        { label: "Suppliers", href: "/inventory/batches/suppliers" },
      ],
    },
    {
      href: "/inventory/movements",
      label: "Movement",
      icon: Package,
      data: [
        { label: "All Movements", href: "/inventory/movements" },
        { label: "Stock In", href: "/inventory/movements/stock-in" },
        { label: "Stock Out", href: "/inventory/movements/stock-out" },
        { label: "Transfers", href: "/inventory/movements/transfers" },
      ],
    },
    {
      href: "/inventory/suppliers",
      label: "Suppliers",
      icon: Package,
      data: [
        { label: "All Suppliers", href: "/inventory/suppliers" },
        { label: "Add Supplier", href: "/inventory/suppliers/create" },
      ],
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}

        <IconRailSidebar
          initials="IN"
          badgeColor="bg-green-500"
          items={inventoryItems}
          rootHref="/inventory"
          switchHref="/"
          switchLabel="Switch"
        />

        {/* Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <Link href="/inventory" className="text-sm font-semibold">
                Inventory App
              </Link>

              <span className="text-xs text-muted-foreground">/</span>

              <span className="text-xs text-muted-foreground">
                Manage Items
              </span>
            </div>

            {/* Right Side Content (Future actions / user profile / etc) */}
            <div className="text-xs text-muted-foreground" />
          </header>

          {/* Page Content */}
          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default InventoryLayout;
