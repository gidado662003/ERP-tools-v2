"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, ChevronRight, LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDisplayMode } from "@/lib/store";

interface SubItem {
  label: string;
  href: string;
}

interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  data?: SubItem[];
}

interface IconRailSidebarProps {
  initials: string;
  badgeColor?: string;
  items: NavItemConfig[];
  rootHref: string;
  switchHref?: string;
  switchLabel?: string;
}

interface DrawerState {
  visible: boolean;
  top: number;
  label: string;
  items: SubItem[];
}

function NavItem({
  href,
  data,
  label,
  icon: Icon,
  rootHref,
  onHover,
  onLeave,
}: NavItemConfig & {
  rootHref: string;
  onHover: (rect: DOMRect, label: string, items: SubItem[]) => void;
  onLeave: () => void;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const active =
    pathname === href || (href !== rootHref && pathname?.startsWith(href));

  return (
    <div
      ref={ref}
      className="relative w-full flex justify-center"
      onMouseEnter={() => {
        if (ref.current) {
          onHover(ref.current.getBoundingClientRect(), label, data ?? []);
        }
      }}
      onMouseLeave={onLeave}
    >
      <Link
        href={href}
        className={[
          "relative flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg text-[8px] font-medium transition-colors duration-150",
          active
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        ].join(" ")}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-blue-500 -translate-x-[8px]" />
        )}
        <Icon
          size={20}
          className={active ? "text-blue-500 dark:text-blue-400" : ""}
        />
        <span className="leading-none tracking-wide truncate max-w-full px-0.5">
          {label.split(" ")[0].toLowerCase()}
        </span>
        {data && data.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-blue-300" />
        )}
      </Link>
    </div>
  );
}

function HoverDrawer({
  state,
  onMouseEnter,
  onMouseLeave,
}: {
  state: DrawerState;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const pathname = usePathname();

  if (!state.visible || state.items.length === 0) return null;

  return createPortal(
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ top: state.top, left: 64 }}
      className="fixed z-[99999] w-[212px] bg-card border border-border rounded-xl overflow-hidden shadow-lg shadow-black/5"
    >
      <div className="px-3 pt-3 pb-2 border-b border-border/60">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
          {state.label}
        </p>
      </div>
      <div className="p-1.5 flex flex-col gap-0.5">
        {state.items.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors duration-100",
                active
                  ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground",
              ].join(" ")}
            >
              <span>{item.label}</span>
              <ChevronRight
                size={11}
                className={
                  active ? "text-blue-400" : "text-muted-foreground/30"
                }
              />
            </Link>
          );
        })}
      </div>
      <div className="absolute -left-[5px] top-[13px] h-2.5 w-2.5 rotate-45 rounded-sm border-l border-b border-border bg-card" />
    </div>,
    document.body,
  );
}

export default function IconRailSidebar({
  initials,
  badgeColor = "bg-blue-600",
  items,
  rootHref,
  switchHref = "/",
  switchLabel = "Switch",
}: IconRailSidebarProps) {
  const toggleMode = useDisplayMode((state) => state.toggleMode);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>({
    visible: false,
    top: 0,
    label: "",
    items: [],
  });

  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => {
      setDrawer((d) => ({ ...d, visible: false }));
    }, 100);
  };

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const handleHover = (rect: DOMRect, label: string, subItems: SubItem[]) => {
    cancelHide();
    setDrawer({
      visible: true,
      top: rect.top,
      label,
      items: subItems,
    });
  };

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  return (
    <>
      <div className="w-14 shrink-0 border-r border-border bg-card hidden md:flex flex-col h-screen sticky top-0 items-center py-3 gap-1">
        <Link
          href={rootHref}
          className={[
            "w-8 h-8 rounded-lg grid place-items-center text-white font-medium text-[10px] tracking-wider mb-3 hover:opacity-90 transition-opacity select-none",
            badgeColor,
          ].join(" ")}
        >
          {initials}
        </Link>

        <div className="w-8 h-px bg-border mb-1" />

        <nav className="flex-1 flex flex-col gap-0.5 w-full px-1.5">
          {items.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              rootHref={rootHref}
              onHover={handleHover}
              onLeave={scheduleHide}
            />
          ))}
        </nav>

        <div className="w-8 h-px bg-border mb-1" />

        <div className="mb-1">
          <Switch onChange={toggleMode} />
        </div>

        <footer>
          <Link
            href={switchHref}
            className="flex flex-col items-center gap-1 w-9 h-9 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors group"
          >
            <ArrowLeftRight
              size={13}
              className="mt-2 transition-transform group-hover:scale-110"
            />
            <span className="tracking-wide leading-none">{switchLabel}</span>
          </Link>
        </footer>
      </div>

      <HoverDrawer
        state={drawer}
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      />
    </>
  );
}
