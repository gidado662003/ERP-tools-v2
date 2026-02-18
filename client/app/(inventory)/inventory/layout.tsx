"use client";
import React from "react";
import InventorySidebar from "@/components/inventory/inventory-app-sidebar";
import Link from "next/link";

function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <InventorySidebar />

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
