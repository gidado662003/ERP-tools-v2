"use client";
import React from "react";
import Link from "next/link";
import {
  Moon,
  Sun,
  Bell,
  Settings,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import * as Icons from "lucide-react";
import { useModuleStore } from "@/lib/moduleStore";
import { useDisplayMode } from "@/lib/store";
import { Module } from "@/lib/module/moduleType";

type UserRole =
  | "Admin Manager"
  | "Developer"
  | "Operations"
  | "Logistics"
  | string;

const CLS = {
  shell: "min-h-screen flex flex-col bg-[#f5f3f0] dark:bg-[#0e0c1a] font-sans",
  topbar:
    "h-[46px] flex items-center justify-between px-4 bg-white dark:bg-[#141320] border-b border-[#e0dfe3] dark:border-border/20 shrink-0 sticky top-0 z-50",
  brand: "flex items-center gap-2",
  brandMark:
    "w-6 h-6 rounded-[6px] bg-[#6c5fc7] flex items-center justify-center",
  brandName: "text-[13px] font-medium text-foreground",
  topbarDivider: "w-px h-4 bg-[#e0dfe3] dark:bg-border/20 mx-1",
  orgChip: "flex items-center gap-1.5 text-[12px] text-muted-foreground",
  orgDot: "w-1.5 h-1.5 rounded-full bg-[#6c5fc7]",
  topbarRight: "flex items-center gap-1",
  iconBtn:
    "w-7 h-7 rounded-md border border-[#e0dfe3] dark:border-border/20 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors",
  avatar:
    "w-[26px] h-[26px] rounded-full bg-[#6c5fc7] flex items-center justify-center text-[10px] font-medium text-white ml-1",
  body: "flex flex-1 min-h-0",
  sidebar:
    "w-12 bg-white dark:bg-[#141320] border-r border-[#e0dfe3] dark:border-border/20 flex flex-col items-center py-2.5 gap-0.5 shrink-0",
  sbItem: (active: boolean) =>
    `w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
      active
        ? "bg-[#EEEDFE] text-[#6c5fc7] dark:bg-[#26215C] dark:text-[#AFA9EC]"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`,
  content: "flex-1 p-5 overflow-auto",
  pageTitle: "text-[15px] font-medium text-foreground mb-0.5",
  pageSub: "text-[12px] text-muted-foreground mb-5",
  statsGrid: "grid grid-cols-4 gap-2 mb-5",
  statCard: "bg-secondary rounded-lg px-3.5 py-3",
  statLabel:
    "text-[11px] text-muted-foreground uppercase tracking-[.04em] mb-1.5",
  statVal: "text-[20px] font-medium leading-none",
  sectionRow: "flex items-center gap-2 mb-2.5",
  sectionTitle:
    "text-[11px] font-medium tracking-[.05em] uppercase text-muted-foreground whitespace-nowrap",
  sectionLine: "flex-1 h-px bg-[#e0dfe3] dark:bg-border/20",
  modulesGrid: "grid grid-cols-3 gap-2 mb-5",
  mcard:
    "relative bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-border/20 rounded-xl p-3.5 overflow-hidden cursor-pointer hover:border-[#b0adb8] dark:hover:border-border/40 transition-colors",
  mcardAccent: "absolute top-0 left-0 right-0 h-[1.5px]",
  mcardHead: "flex items-center justify-between mb-2.5",
  mcardIcon: "w-[30px] h-[30px] rounded-[8px] flex items-center justify-center",
  mcardName: "text-[13px] font-medium text-foreground mb-0.5",
  mcardDesc: "text-[11px] text-muted-foreground leading-relaxed mb-2.5",
  mcardFooter: "flex items-center justify-between",
  mcardStat: "text-[11px] text-muted-foreground",
  actCard:
    "bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-border/20 rounded-xl px-4 py-1",
  actRow:
    "flex items-center gap-2.5 py-2.5 border-b border-[#e0dfe3] dark:border-border/20 last:border-0",
  actDot: "w-1.5 h-1.5 rounded-full shrink-0",
  actText: "text-[12px] text-muted-foreground flex-1",
  actStrong: "text-foreground font-medium",
  actTime: "text-[11px] text-muted-foreground whitespace-nowrap",
  emptyModules:
    "col-span-3 py-12 text-center text-[13px] text-muted-foreground",
};

const ACTIVITY = [
  {
    color: "#10B981",
    text: "New requisition submitted",
    label: "Office supplies restock",
    time: "5m ago",
  },
  {
    color: "#A32D2D",
    text: "Action item overdue",
    label: "Resolve API rate limit issue",
    time: "1h ago",
  },
  {
    color: "#6c5fc7",
    text: "Meeting minutes uploaded",
    label: "Q2 Performance Review",
    time: "3h ago",
  },
  {
    color: "#F59E0B",
    text: "Document added",
    label: "Q1 Sales Deck.pptx",
    time: "Yesterday",
  },
  {
    color: "#8B5CF6",
    text: "Stock alert",
    label: "Printer cartridges below threshold",
    time: "Yesterday",
  },
];

const NAV_ICONS = [LayoutGrid, Icons.FileText, Icons.Calendar, Icons.Package];

function getVisibleModules(modules: Module[], department: string) {
  return modules.filter((m) => {
    if (!m.isActive) return false;
    if (m.allowedDepartments.length === 0) return true;
    return m.allowedDepartments.some((d) =>
      typeof d === "string" ? d === department : d.name === department,
    );
  });
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomePage({
  userName,
  modules: rawModules,
}: {
  userName: string;
  modules: Module[];
}) {
  const toggleMode = useDisplayMode((s) => s.toggleMode);
  const mode = useDisplayMode((s) => s.mode);
  const setModule = useModuleStore((s) => s.setModule);

  // TODO: pull from auth store
  const userDepartment = "Development";

  const visibleModules = getVisibleModules(rawModules, userDepartment);

  return (
    <div className={CLS.shell}>
      <header className={CLS.topbar}>
        <div className="flex items-center gap-2">
          <div className={CLS.brand}>
            <div className={CLS.brandMark}>
              <LayoutGrid size={12} color="white" />
            </div>
            <span className={CLS.brandName}>Syscodes Tools</span>
          </div>
          <div className={CLS.topbarDivider} />
          <div className={CLS.orgChip}>
            <div className={CLS.orgDot} />
            Syscodes Communications
          </div>
        </div>
        <div className={CLS.topbarRight}>
          <button className={CLS.iconBtn} aria-label="Notifications">
            <Bell size={13} />
          </button>
          <button
            className={CLS.iconBtn}
            onClick={toggleMode}
            aria-label="Toggle theme"
          >
            {mode === "light" ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          <div className={CLS.avatar}>{getInitials(userName)}</div>
        </div>
      </header>

      <div className={CLS.body}>
        {/* <nav className={CLS.sidebar}>
          {NAV_ICONS.map((Icon, i) => (
            <div key={i} className={CLS.sbItem(i === 0)}>
              <Icon size={15} />
            </div>
          ))}
          <div className="flex-1" />
          <div className={CLS.sbItem(false)}>
            <Settings size={15} />
          </div>
        </nav> */}

        <main className={CLS.content}>
          <div className={CLS.pageTitle}>
            Good {getTimeOfDay()}, {userName.split(" ")[0]}
          </div>
          <div className={CLS.pageSub}>
            Here's what's happening across your modules today.
          </div>

          <div className={CLS.statsGrid}>
            {[
              { label: "Open requests", val: "14", color: "text-[#6c5fc7]" },
              { label: "Pending actions", val: "7", color: "text-[#854F0B]" },
              { label: "Low stock items", val: "3", color: "text-[#A32D2D]" },
              { label: "Meetings today", val: "2", color: "text-[#3B6D11]" },
            ].map(({ label, val, color }) => (
              <div key={label} className={CLS.statCard}>
                <div className={CLS.statLabel}>{label}</div>
                <div className={`${CLS.statVal} ${color}`}>{val}</div>
              </div>
            ))}
          </div>

          <div className={CLS.sectionRow}>
            <span className={CLS.sectionTitle}>Modules</span>
            <div className={CLS.sectionLine} />
          </div>

          <div className={CLS.modulesGrid}>
            {visibleModules.length === 0 ? (
              <div className={CLS.emptyModules}>
                No modules available for your department.
              </div>
            ) : (
              visibleModules.map((m) => {
                const Icon =
                  (Icons[
                    m.ui.icon as keyof typeof Icons
                  ] as React.ElementType) || Icons.Box;
                return (
                  <Link
                    key={m.key}
                    href={m.href}
                    onClick={() => setModule(m.key)}
                    className={CLS.mcard}
                  >
                    <div
                      className={CLS.mcardAccent}
                      style={{ background: m.ui.accent }}
                    />
                    <div className={CLS.mcardHead}>
                      <div
                        className={CLS.mcardIcon}
                        style={{ background: m.ui.iconBg }}
                      >
                        <Icon size={15} style={{ color: m.ui.iconColor }} />
                      </div>
                    </div>
                    <div className={CLS.mcardName}>{m.name}</div>
                    <div className={CLS.mcardDesc}>{m.description}</div>
                    <div className={CLS.mcardFooter}>
                      <ChevronRight
                        size={13}
                        className="text-muted-foreground ml-auto"
                      />
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className={CLS.sectionRow}>
            <span className={CLS.sectionTitle}>Recent activity</span>
            <div className={CLS.sectionLine} />
          </div>

          <div className={CLS.actCard}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className={CLS.actRow}>
                <div className={CLS.actDot} style={{ background: a.color }} />
                <span className={CLS.actText}>
                  {a.text} — <span className={CLS.actStrong}>{a.label}</span>
                </span>
                <span className={CLS.actTime}>{a.time}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
