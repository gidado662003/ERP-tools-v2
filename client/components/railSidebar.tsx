"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, LucideIcon } from "lucide-react";

interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface IconRailSidebarProps {
  initials: string;

  badgeColor?: string;

  items: NavItemConfig[];

  rootHref: string;

  switchHref?: string;
  switchLabel?: string;
}

function NavItem({
  href,
  label,
  icon: Icon,
  rootHref,
  badgeColor,
}: NavItemConfig & { rootHref: string; badgeColor: string }) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== rootHref && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[10px] transition-colors w-full",
        active
          ? `bg-accent text-blue-500 font-medium border border-l-${badgeColor.replace("bg-", "")}`
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      ].join(" ")}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate leading-none">{label}</span>
    </Link>
  );
}

export default function IconRailSidebar({
  initials,
  badgeColor = "bg-blue-500",
  items,
  rootHref,
  switchHref = "/",
  switchLabel = "Switch",
}: IconRailSidebarProps) {
  return (
    <div className="hidden w-20 shrink-0 border-r bg-card md:flex flex-col h-screen sticky top-0">
      <div className="flex h-14 items-center justify-center border-b">
        <Link
          href={rootHref}
          className={[
            "grid cursor-pointer  h-10 w-10 place-items-center hover:translate-0.5 rounded-xl text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow-lg select-none",
            badgeColor,
          ].join(" ")}
        >
          {initials}
        </Link>
      </div>

      <nav className="px-2 py-3 flex flex-col gap-1">
        {items.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            rootHref={rootHref}
            badgeColor={badgeColor}
          />
        ))}
      </nav>

      <footer className="mt-auto border-t p-2">
        <Link href={switchHref}>
          <button className="flex flex-col items-center gap-1 w-full rounded-md px-2 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <ArrowLeftRight size={18} className="text-blue-500 shrink-0" />
            <span>{switchLabel}</span>
          </button>
        </Link>
      </footer>
    </div>
  );
}
