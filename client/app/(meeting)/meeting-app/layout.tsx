"use client";
import React from "react";
import MeetingAppSidebar from "@/components/meeting-app/meeting-app-sidebar";
import Link from "next/link";
import IconRailSidebar from "@/components/railSidebar";
import { LayoutDashboard, Bot, ListChecks } from "lucide-react";

function MeetingLayout({ children }: { children: React.ReactNode }) {
  const sidebarItems = [
    {
      href: "/meeting-app",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/meeting-app/meeting-list",
      label: "Meetings",
      icon: ListChecks,
    },
    {
      href: "/meeting-app/aibot",
      label: "AI Bot",
      icon: Bot,
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <IconRailSidebar
          items={sidebarItems}
          rootHref="/meeting-app"
          initials="MA"
        />

        {/* Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <Link href="/meeting-app" className="text-sm font-semibold">
                Meeting App
              </Link>

              <span className="text-xs text-muted-foreground">/</span>

              <span className="text-xs text-muted-foreground">
                Manage Meetings
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

export default MeetingLayout;
