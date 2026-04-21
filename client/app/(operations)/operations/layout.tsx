"use client";
import React from "react";
import IconRailSidebar from "@/components/railSidebar";
import {
  LayoutDashboard,
  Briefcase,
  PackageSearch,
  ClipboardList,
  Users,
} from "lucide-react";
import Link from "next/link";

function OperationsLayout({ children }: { children: React.ReactNode }) {
  const operationsItems = [
    {
      href: "/operations",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/operations/jobs",
      label: "Jobs",
      icon: Briefcase,
      data: [
        { label: "All Jobs", href: "/operations/jobs" },
        { label: "Create Job", href: "/operations/jobs/create" },
      ],
    },
    {
      href: "/operations/material-requests",
      label: "Material Requests",
      icon: PackageSearch,
      data: [
        { label: "All Requests", href: "/operations/material-requests" },
        { label: "New Request", href: "/operations/material-requests/create" },
      ],
    },
    {
      href: "/operations/technicians",
      label: "Technicians",
      icon: Users,
      data: [{ label: "All Technicians", href: "/operations/technicians" }],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <IconRailSidebar
          initials="OP"
          badgeColor="bg-red-500"
          items={operationsItems}
          rootHref="/operations"
          switchHref="/"
          switchLabel="Switch"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <Link href="/operations" className="text-sm font-semibold">
                Operations
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">
                Manage Operations
              </span>
            </div>
            <div className="text-xs text-muted-foreground" />
          </header>

          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default OperationsLayout;
