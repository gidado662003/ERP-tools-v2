"use client";
import React from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  Bell,
  LayoutGrid,
  ChevronRight,
  Settings,
} from "lucide-react";
import * as Icons from "lucide-react";
import { useModuleStore } from "@/lib/moduleStore";
import { useDisplayMode } from "@/lib/store";
import { Module, Activity, Stats } from "@/lib/module/moduleType";

// ─── stat card config ────────────────────────────────────────────────────────
type StatConfig = {
  label: string;
  val: string | number;
  accent: string;
  iconBg: string;
  iconColor: string;
  icon: keyof typeof Icons;
};

function buildStats(stats: Stats): StatConfig[] {
  return [
    {
      label: "Open requests",
      val: stats.requisitions,
      accent: "#6c5fc7",
      iconBg: "#EEEDFE",
      iconColor: "#6c5fc7",
      icon: "FileText",
    },
    {
      label: "Pending actions",
      val: stats.pendingActionItems,
      accent: "#BA7517",
      iconBg: "#FAEEDA",
      iconColor: "#BA7517",
      icon: "CheckSquare",
    },
    {
      label: "Unread messages",
      val: stats.unreadMessages,
      accent: "#A32D2D",
      iconBg: "#FCEBEB",
      iconColor: "#A32D2D",
      icon: "MessageSquare",
    },
    {
      label: "Meetings today",
      val: stats.meetings,
      accent: "#3B6D11",
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
      icon: "CalendarCheck",
    },
  ];
}

// ─── activity style lookup ────────────────────────────────────────────────────
const ACTIVITY_STYLES: Record<
  string,
  { bg: string; color: string; icon: keyof typeof Icons }
> = {
  requisition: { bg: "#E1F5EE", color: "#1D9E75", icon: "ClipboardCheck" },
  action_item: { bg: "#FCEBEB", color: "#A32D2D", icon: "AlertCircle" },
  meeting: { bg: "#EEEDFE", color: "#6c5fc7", icon: "FileText" },
  document: { bg: "#FAEEDA", color: "#BA7517", icon: "FilePlus" },
  stock: { bg: "#FCEBEB", color: "#A32D2D", icon: "AlertTriangle" },
};
const FALLBACK_STYLE = {
  bg: "#f0edf8",
  color: "#80748d",
  icon: "Activity" as keyof typeof Icons,
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── sub-components ───────────────────────────────────────────────────────────
function StatCard({ s }: { s: StatConfig }) {
  const Icon = (Icons[s.icon] as React.ElementType) || Icons.Activity;
  return (
    <div
      className="relative bg-white dark:bg-[#141320] border border-[#e5e3ee] dark:border-border/20 rounded-[10px] p-3.5 overflow-hidden"
      style={{ borderTop: `2px solid ${s.accent}` }}
    >
      <div
        className="w-6 h-6 rounded-[6px] flex items-center justify-center mb-2.5"
        style={{ background: s.iconBg }}
      >
        <Icon size={13} style={{ color: s.iconColor }} />
      </div>
      <div
        className="text-[22px] font-medium leading-none tracking-tight"
        style={{ color: s.accent }}
      >
        {s.val}
      </div>
      <div className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground mt-1">
        {s.label}
      </div>
    </div>
  );
}

function ModuleCard({ m, onClick }: { m: Module; onClick: () => void }) {
  const Icon =
    (Icons[m.ui.icon as keyof typeof Icons] as React.ElementType) || Icons.Box;
  return (
    <Link
      href={m.href}
      onClick={onClick}
      className="relative bg-white dark:bg-[#141320] border border-[#e5e3ee] dark:border-border/20 rounded-[11px] p-3.5 overflow-hidden
                 hover:border-[#b0adb8] dark:hover:border-border/40 hover:-translate-y-px
                 transition-[border-color,transform] duration-150 block"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: m.ui.accent }}
      />
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center mb-2.5"
        style={{ background: m.ui.iconBg }}
      >
        <Icon size={16} style={{ color: m.ui.iconColor }} />
      </div>
      <div className="text-[12.5px] font-medium text-foreground mb-0.5">
        {m.name}
      </div>
      <div className="text-[11px] text-muted-foreground leading-[1.55] mb-2.5">
        {m.description}
      </div>
      <div className="flex justify-end">
        <ChevronRight size={13} className="text-[#b0adb8]" />
      </div>
    </Link>
  );
}

function ActivityRow({ a }: { a: Activity }) {
  const style = ACTIVITY_STYLES[a.type] ?? FALLBACK_STYLE;
  const Icon =
    (Icons[style.icon as keyof typeof Icons] as React.ElementType) ||
    Icons.Activity;
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[#f0eef5] dark:border-border/10 last:border-0 hover:bg-[#faf9fd] dark:hover:bg-white/[0.02] transition-colors">
      <div
        className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center shrink-0"
        style={{ background: style.bg }}
      >
        <Icon size={13} style={{ color: style.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-foreground truncate">{a.text}</div>
        <div className="text-[11px] text-muted-foreground mt-px">{a.label}</div>
      </div>
      <span className="text-[11px] text-[#b0adb8] whitespace-nowrap font-mono">
        {a.time}
      </span>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase text-muted-foreground whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-[#e5e3ee] dark:bg-border/20" />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function HomePage({
  userName,
  modules,
  activity,
  stats,
}: {
  userName: string;
  modules: Module[];
  activity: Activity[];
  stats: Stats;
}) {
  const toggleMode = useDisplayMode((s) => s.toggleMode);
  const mode = useDisplayMode((s) => s.mode);
  const setModule = useModuleStore((s) => s.setModule);

  const statCards = buildStats(stats);
  const visibleModules = modules.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f6fb] dark:bg-[#0e0c1a] font-sans">
      {/* Topbar */}
      <header className="h-[46px] flex items-center justify-between px-4 bg-white dark:bg-[#141320] border-b border-[#e5e3ee] dark:border-border/20 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[6px] bg-[#6c5fc7] flex items-center justify-center">
              <LayoutGrid size={12} color="white" />
            </div>
            <span className="text-[13px] font-medium text-foreground tracking-[-0.01em]">
              Syscodes Tools
            </span>
          </div>
          <div className="w-px h-[14px] bg-[#e5e3ee] dark:bg-border/20 mx-1" />
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6c5fc7]" />
            Syscodes Communications
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 rounded-[7px] border border-[#e5e3ee] dark:border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#f5f3fb] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={13} />
          </button>
          <button
            className="w-7 h-7 rounded-[7px] border border-[#e5e3ee] dark:border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#f5f3fb] transition-colors"
            onClick={toggleMode}
            aria-label="Toggle theme"
          >
            {mode === "light" ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          <div className="w-[26px] h-[26px] rounded-full bg-[#6c5fc7] flex items-center justify-center text-[10px] font-medium text-white ml-1">
            {getInitials(userName)}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 p-5 overflow-auto">
          {/* Greeting */}
          <div className="mb-4">
            <div className="text-[15px] font-medium text-foreground tracking-[-0.015em]">
              Good {getTimeOfDay()}, {userName.split(" ")[0]}
            </div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              Here's what's happening across your modules today.
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {statCards.map((s) => (
              <StatCard key={s.label} s={s} />
            ))}
          </div>

          {/* Modules */}
          <SectionDivider title="Modules" />
          <div className="grid grid-cols-3 gap-2 mb-5">
            {visibleModules.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-[13px] text-muted-foreground">
                No modules available.
              </div>
            ) : (
              visibleModules.map((m) => (
                <ModuleCard
                  key={m.key}
                  m={m}
                  onClick={() => setModule(m.key)}
                />
              ))
            )}
          </div>

          {/* Activity */}
          <SectionDivider title="Recent activity" />
          <div className="bg-white dark:bg-[#141320] border border-[#e5e3ee] dark:border-border/20 rounded-[11px] overflow-hidden">
            {activity.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              activity.map((a, i) => <ActivityRow key={i} a={a} />)
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
