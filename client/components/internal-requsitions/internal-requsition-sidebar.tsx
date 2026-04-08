"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Plus, ArrowLeftRight } from "lucide-react";

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
  const active =
    pathname === href ||
    (href !== "/internal-requisitions" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[10px] transition-colors w-full",
        active
          ? "bg-accent text-blue-500 font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      ].join(" ")}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate leading-none">{label}</span>
    </Link>
  );
}

export default function InternalRequisitionSidebar() {
  return (
    <div className="hidden w-20 shrink-0 border-r bg-card md:flex flex-col h-screen sticky top-0">
      <div className="flex h-14 items-center justify-center border-b">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-sm select-none">
          IR
        </div>
      </div>

      <nav className="px-2 py-3 flex flex-col gap-1">
        <NavItem
          href="/internal-requisitions"
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
        />
        <NavItem
          href="/internal-requisitions/requisition-list"
          label="Requisitions"
          icon={<Users size={18} />}
        />
        <NavItem
          href="/internal-requisitions/create-request"
          label="Create"
          icon={<Plus size={18} />}
        />
      </nav>

      <footer className="mt-auto border-t p-2">
        <Link href="/">
          <button className="flex flex-col items-center gap-1 w-full rounded-md px-2 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ArrowLeftRight size={18} className="text-blue-500 shrink-0" />
            <span>Switch</span>
          </button>
        </Link>
      </footer>
    </div>
  );
}
