"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trash2,
  ArrowLeftRight,
  FileStack,
} from "lucide-react";

function NavItem({
  href,
  label,
  icon,
  exact = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();

  const active = exact
    ? pathname === href || pathname === href.replace(/\/$/, "")
    : pathname?.startsWith(href) && !pathname?.startsWith("/documents/bin");

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
        active
          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "shrink-0 transition-colors",
          active
            ? "text-blue-500"
            : "text-muted-foreground/70 group-hover:text-foreground",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
      )}
    </Link>
  );
}

export default function DocumentsSidebar() {
  return (
    <div className="hidden w-60 shrink-0 border-r bg-card md:flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 px-4 border-b">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500 text-white shrink-0">
          <FileStack size={16} />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold truncate">Document Library</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Management
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
          Library
        </p>

        <NavItem
          href="/documents"
          label="Documents"
          icon={<LayoutDashboard size={17} />}
        />
        <NavItem
          href="/documents/bin"
          label="Bin"
          icon={<Trash2 size={17} />}
          exact
        />
      </nav>

      {/* Footer */}
      <footer className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeftRight size={17} className="text-blue-500 shrink-0" />
          <span>Switch Module</span>
        </Link>
      </footer>
    </div>
  );
}
