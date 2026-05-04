"use client";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/admin-sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconRailSidebar from "@/components/railSidebar";
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  Building2,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminLogin = pathname === "/admin/login";

  const adminItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Building2,
      data: [
        { label: "All Users", href: "/admin/users" },
        { label: "Add User", href: "/admin/users/create" },
      ],
    },
    {
      href: "/admin/chats",
      label: "Chats",
      icon: MessageSquare,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      data: [
        { label: "Profile", href: "/admin/settings/profile" },
        { label: "Roles", href: "/admin/settings/roles" },
        { label: "Permissions", href: "/admin/settings/permissions" },
        { label: "Modules", href: "/admin/settings/modules" },
      ],
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen">
          {!isAdminLogin && (
            <IconRailSidebar
              initials="AD"
              badgeColor="bg-green-500"
              items={adminItems}
              rootHref="/admin"
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            {/* top bar */}
            {!isAdminLogin && (
              <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Link href="/admin" className="text-sm font-semibold">
                    Admin Console
                  </Link>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-xs text-muted-foreground">
                    Manage users & chats
                  </span>
                </div>
                <div className="text-xs text-muted-foreground"></div>
              </header>
            )}

            <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
