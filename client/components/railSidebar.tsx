"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, ChevronRight, LucideIcon } from "lucide-react";

interface SubItems {
  label: string;
  href: string;
}
interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  data?: SubItems[];
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
  data,
  label,
  icon: Icon,
  rootHref,
  badgeColor,
}: NavItemConfig & { rootHref: string; badgeColor: string }) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== rootHref && pathname?.startsWith(href));

  const hasSubItems = data && data.length > 0;

  return (
    <div className="relative group/nav w-full">
      <Link
        href={href}
        className={[
          "relative flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[10px] font-medium transition-all duration-150 w-full",
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        ].join(" ")}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-blue-500" />
        )}
        <Icon
          size={24}
          className={[
            "shrink-0 transition-transform w-[160px] duration-150 group-hover/nav:scale-110",
            active ? "text-blue-500 dark:text-blue-400" : "",
          ].join(" ")}
        />
        <span className="truncate text-[9px] text-center leading-none tracking-wide block w-full">
          {label.split(" ").map((word, index) => (
            <span key={index} className="block">
              {word}
            </span>
          ))}
        </span>

        {/* Sub-items dot indicator */}
        {hasSubItems && (
          <span className="absolute top-2 right-2 h-1 w-1 rounded-full bg-blue-400/60" />
        )}
      </Link>

      {/* Hover drawer */}
      {hasSubItems && (
        <div
          className={[
            "absolute left-[calc(100%+10px)] top-0 z-[9999] min-w-[188px]",
            "rounded-xl border border-border bg-card shadow-xl shadow-black/8",
            "pointer-events-none opacity-0 -translate-x-2",
            "group-hover/nav:pointer-events-auto group-hover/nav:opacity-100 group-hover/nav:translate-x-0",
            "transition-all duration-200 ease-out",
          ].join(" ")}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-2 border-b border-border/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {label}
            </p>
          </div>

          {/* Links */}
          <div className="p-1.5 flex flex-col gap-0.5">
            {data.map((subItem) => {
              const subActive =
                pathname === subItem.href || pathname?.startsWith(subItem.href);
              return (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={[
                    "flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors duration-100",
                    subActive
                      ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-foreground/80 hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  <span>{subItem.label}</span>
                  <ChevronRight
                    size={12}
                    className={
                      subActive ? "text-blue-400" : "text-muted-foreground/30"
                    }
                  />
                </Link>
              );
            })}
          </div>

          {/* Arrow pointer */}
          <div className="absolute -left-[5px] top-[14px] h-2.5 w-2.5 rotate-45 rounded-sm border-l border-b border-border bg-card" />
        </div>
      )}
    </div>
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
    <div className=" w-[80px] shrink-0 border-r border-gray-200 bg-card md:flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center">
        <Link
          href={rootHref}
          className={[
            "grid cursor-pointer h-9 w-9 place-items-center rounded-xl text-white font-bold text-xs tracking-widest shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 select-none",
            badgeColor,
          ].join(" ")}
        >
          {initials}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {items.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            rootHref={rootHref}
            badgeColor={badgeColor}
          />
        ))}
      </nav>

      {/* Footer */}
      <footer className="border-t border-gray-200 p-2">
        <Link
          href={switchHref}
          className="flex flex-col items-center gap-1.5 w-full rounded-xl px-2 py-2.5 text-[10px] font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground group"
        >
          <ArrowLeftRight
            size={15}
            className="shrink-0 transition-transform duration-150 group-hover:scale-110"
          />
          <span className="tracking-wide">{switchLabel}</span>
        </Link>
      </footer>
    </div>
  );
}
