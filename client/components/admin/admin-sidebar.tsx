"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquareText } from "lucide-react";

function NavItem({
    href,
    label,
    icon,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    const pathname = usePathname();
    const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));

    return (
        <Link
            href={href}
            className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-accent text-blue-500" : "text-muted-foreground hover:bg-accent/50",
            ].join(" ")}
        >
            <span className="shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
        </Link>
    );
}

export default function AdminSidebar() {
    return (
        <aside className="hidden w-64 max-w-screen shrink-0 border-r bg-card md:block">
            <div className="flex h-16 items-center px-4">
                <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500 text-primary-foreground">
                        A
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold">Admin</div>
                        <div className="text-xs text-muted-foreground">Chat App</div>
                    </div>
                </div>
            </div>

            <nav className="space-y-1 px-3 py-4">
                <NavItem href="/admin" label="Dashboard" icon={<LayoutDashboard size={18} />} />
                <NavItem href="/admin/users" label="Users" icon={<Users size={18} />} />
                <NavItem href="/admin/chats" label="Chats" icon={<MessageSquareText size={18} />} />
            </nav>
        </aside>
    );
}

