"use client"
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/admin-sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminLogin = pathname === "/admin/login"

    return (
        <AdminGuard>
            <div className="min-h-screen bg-background">
                <div className="flex min-h-screen">

                    {!isAdminLogin && (<AdminSidebar />)}


                    <div className="flex min-w-0 flex-1 flex-col">
                        {/* top bar */}
                        {!isAdminLogin && (<header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <Link href="/admin" className="text-sm font-semibold">
                                    Admin Console
                                </Link>
                                <span className="text-xs text-muted-foreground">/</span>
                                <span className="text-xs text-muted-foreground">Manage users & chats</span>
                            </div>
                            <div className="text-xs text-muted-foreground"></div>
                        </header>)}


                        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
