import React from "react";
import {
  ActionItem,
  Owner,
  DashboardData,
} from "@/lib/meeting/meetingAppTypes";

const CLS = {
  dash: "font-sans",
  sectionLabel:
    "text-[11px] font-medium tracking-[0.06em] uppercase text-muted-foreground mb-2.5",
  statGrid: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6",
  statCard: "bg-secondary rounded-lg px-4 py-3.5",
  statLabel: "text-xs text-muted-foreground mb-1.5",
  statValue: "text-[22px] font-medium leading-none",
  card: "bg-background border border-border/40 rounded-xl p-5 mb-4",
  cardTitle: "text-[13px] font-medium mb-3",
  rowGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4",
  pill: "inline-block text-[11px] font-medium px-2 py-0.5 rounded-full",
  activityItem:
    "flex items-start gap-2.5 py-2.5 border-b border-border/30 last:border-0 last:pb-0",
  activityIcon:
    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[13px] font-medium",
  activityTitle: "text-[13px] text-foreground truncate mb-0.5",
  activityMeta:
    "text-xs text-muted-foreground flex gap-2 flex-wrap items-center",
  ownerRow:
    "flex items-center gap-2 py-2 border-b border-border/30 last:border-0 last:pb-0",
  avatar:
    "w-[26px] h-[26px] rounded-full bg-[#EEEDFE] text-[#534AB7] text-[11px] font-medium flex items-center justify-center shrink-0",
  badge: "text-[11px] px-1.5 py-0.5 rounded font-medium",
  deptRow:
    "flex items-center gap-2.5 py-2 border-b border-border/30 last:border-0 last:pb-0",
  progressBg: "flex-1 h-1 bg-secondary rounded-full overflow-hidden",
};

const pillStyle = (status: string, due?: string) => {
  const isOverdue = status !== "completed" && due && new Date(due) < new Date();
  if (isOverdue)
    return {
      className: `${CLS.pill} bg-[#FCEBEB] text-[#A32D2D]`,
      label: "overdue",
    };
  if (status === "completed")
    return {
      className: `${CLS.pill} bg-[#EAF3DE] text-[#3B6D11]`,
      label: "completed",
    };
  if (status === "scheduled")
    return {
      className: `${CLS.pill} bg-[#EEEDFE] text-[#534AB7]`,
      label: "scheduled",
    };
  return {
    className: `${CLS.pill} bg-[#FAEEDA] text-[#854F0B]`,
    label: status,
  };
};

const initials = (username: string) => username?.slice(0, 2).toUpperCase();

const formatDate = (iso: string) =>
  new Date(iso??'').toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const formatPenalty = (p?: string) => (p && p !== "N/A" && p !== "" ? p : null);

export default function MeetingDashboardPage({
  data,
}: {
  data: DashboardData;
}) {
  const { meetings, actions, topOwners, departmentBreakdown, recentActivity } =
    data;

  const completionPct =
    actions.total > 0
      ? Math.round((actions.completed / actions.total) * 100)
      : 0;
  const overduePct =
    actions.total > 0 ? Math.round((actions.overdue / actions.total) * 100) : 0;
  const maxMeetings = Math.max(
    ...departmentBreakdown.map((d) => d.meetingCount),
    1,
  );

  return (
    <div className={CLS.dash}>
      {/* Stats */}
      <div className={CLS.statGrid}>
        {[
          { label: "Meetings", value: meetings, color: "text-[#534AB7]" },
          {
            label: "Total actions",
            value: actions.total,
            color: "text-foreground",
          },
          {
            label: "Completed",
            value: actions.completed,
            color: "text-[#3B6D11]",
          },
          { label: "Overdue", value: actions.overdue, color: "text-[#A32D2D]" },
        ].map(({ label, value, color }) => (
          <div key={label} className={CLS.statCard}>
            <div className={CLS.statLabel}>{label}</div>
            <div className={`${CLS.statValue} ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Completion + overdue rate */}
      <div className={CLS.rowGrid}>
        {[
          {
            label: "Completion rate",
            pct: completionPct,
            count: actions.completed,
            color: "#6c5fc7",
          },
          {
            label: "Overdue rate",
            pct: overduePct,
            count: actions.overdue,
            color: "#E24B4A",
            danger: true,
          },
        ].map(({ label, pct, count, color, danger }) => (
          <div key={label} className={CLS.card}>
            <div className={CLS.cardTitle}>{label}</div>
            <div
              className="text-[26px] font-medium mb-1"
              style={{
                color: danger && pct > 0 ? "#A32D2D" : "var(--foreground)",
              }}
            >
              {pct}%
            </div>
            <div className="flex items-center gap-2">
              <div className={CLS.progressBg}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {count} / {actions.total}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Department breakdown */}
      <div className={CLS.card}>
        <div className={CLS.cardTitle}>Department breakdown</div>
        {departmentBreakdown.map((dept) => (
          <div key={dept.department} className={CLS.deptRow}>
            <span className="text-[13px] font-medium w-24 shrink-0">
              {dept.department}
            </span>
            <div className={CLS.progressBg}>
              <div
                className="h-full rounded-full bg-[#6c5fc7]"
                style={{ width: `${(dept.meetingCount / maxMeetings) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap text-right w-36 shrink-0">
              {dept.meetingCount} mtg · {dept.totalActions} actions ·{" "}
              {dept.overdueActions} overdue
            </span>
          </div>
        ))}
      </div>

      {/* Top owners + recent meetings */}
      <div className={CLS.rowGrid}>
        <div className={CLS.card}>
          <div className={CLS.cardTitle}>Top owners at risk</div>
          {topOwners.map((o) => (
            <div key={o._id} className={CLS.ownerRow}>
              <div className={CLS.avatar}>{initials(o._id)}</div>
              <span className="text-[13px] flex-1 truncate">{o._id}</span>
              {o.overdueCount > 0 && (
                <span className={`${CLS.badge} bg-[#FCEBEB] text-[#A32D2D]`}>
                  {o.overdueCount} overdue
                </span>
              )}
              {o.penaltyCount > 0 && (
                <span className={`${CLS.badge} bg-[#FAEEDA] text-[#854F0B]`}>
                  {o.penaltyCount} penalty
                </span>
              )}
            </div>
          ))}
        </div>

        <div className={CLS.card}>
          <div className={CLS.cardTitle}>Recent meetings</div>
          {recentActivity.meetings.map((m) => {
            const { className: pillCls, label: pillLabel } = pillStyle(
              m.status,
            );
            return (
              <div key={m._id} className={CLS.activityItem}>
                <div
                  className={`${CLS.activityIcon} bg-[#EEEDFE] text-[#534AB7]`}
                >
                  M
                </div>
                <div className="flex-1 min-w-0">
                  <div className={CLS.activityTitle}>{m.title}</div>
                  <div className={CLS.activityMeta}>
                    <span>{m.department}</span>
                    <span>·</span>
                    <span className={pillCls}>{pillLabel}</span>
                    <span>· {m.attendees.length} attendees</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent action items */}
      <div className={CLS.card}>
        <div className={CLS.cardTitle}>Recent action items</div>
        {recentActivity.actionItems.map((item) => {
          const { className: pillCls, label: pillLabel } = pillStyle(
            item.status,
            item.due,
          );
          const penalty = formatPenalty(item.penalty);
          return (
            <div key={item._id} className={CLS.activityItem}>
              <div
                className={`${CLS.activityIcon} bg-[#FCEBEB] text-[#A32D2D]`}
              >
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className={CLS.activityTitle}>{item.desc}</div>
                <div className={CLS.activityMeta}>
                <span>
  {Array.isArray(item.owner)
    ? item.owner
        .map((o) => o?.username)
        .filter(Boolean)
        .join(", ")
    : ""}
</span>
                  <span>·</span>
                  <span className={pillCls}>{pillLabel}</span>
                  <span>· due {formatDate(item.due)}</span>
                  {penalty && <span>· {penalty} penalty</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
