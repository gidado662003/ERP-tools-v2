"use client";
import React, { useState, useEffect } from "react";
import { ActionItem } from "@/lib/meeting/meetingAppTypes";
import { useSetFilter } from "@/helper/setURLquery";
import { formatDate } from "@/helper/dateFormat";
import { mettingAppAPI } from "@/lib/meeting/mettingAppApi";
import { toast } from "sonner";
const CLS = {
  page: "font-sans",
  header: "flex data-center justify-between mb-5",
  title: "text-[18px] font-medium text-foreground",
  subtitle: "text-[13px] text-muted-foreground mt-0.5",
  filterBar: "flex data-center gap-1.5 mb-5 flex-wrap",
  filterBtn: (active: boolean) =>
    `h-8 px-3 rounded-md text-[12px] font-medium border transition-colors cursor-pointer select-none ${
      active
        ? "bg-[#6c5fc7] text-white border-[#6c5fc7]"
        : "bg-background text-muted-foreground border-[#e0dfe3] hover:border-[#b0adb8] hover:text-foreground dark:border-border/30 dark:hover:border-border/60"
    }`,
  card: "bg-background border border-[#e0dfe3] rounded-xl p-4 mb-3 dark:border-border/30 dark:bg-[#141320]",
  cardOverdue:
    "bg-background border border-[#f09595]/50 rounded-xl p-4 mb-3 dark:border-[#f09595]/20 dark:bg-[#141320]",
  cardDone:
    "bg-background border border-[#e0dfe3] rounded-xl p-4 mb-3 dark:border-border/20 dark:bg-[#141320] opacity-50",
  topRow: "flex data-start justify-between gap-3 mb-3",
  desc: "text-[13px] font-medium text-foreground leading-snug flex-1",
  descDone:
    "text-[13px] font-medium text-muted-foreground leading-snug flex-1 line-through",
  pill: "inline-block text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
  metaRow: "flex data-center gap-2.5 flex-wrap",
  metaItem: "text-[12px] text-muted-foreground flex data-center gap-1",
  ownerChip:
    "inline-flex data-center gap-1.5 bg-[#EEEDFE] text-[#534AB7] dark:bg-[#26215C] dark:text-[#AFA9EC] text-[11px] font-medium px-2 py-0.5 rounded-full",
  penaltyChip:
    "inline-flex data-center gap-1.5 bg-[#FAEEDA] text-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775] text-[11px] font-medium px-2 py-0.5 rounded-full",
  completeBtn:
    "h-7 px-3 rounded-md text-[11px] font-medium border border-[#e0dfe3] bg-background hover:bg-[#EAF3DE] hover:text-[#3B6D11] hover:border-[#97C459]/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed dark:border-border/30 dark:hover:bg-[#173404] dark:hover:text-[#C0DD97] dark:hover:border-[#639922]/40",
  empty: "text-center py-16 text-[13px] text-muted-foreground",
  separator: "w-px h-4 bg-[#e0dfe3] dark:bg-border/30",
  emptyTitle: "text-[15px] font-medium text-foreground mb-2",
  emptySubtitle: "text-[13px] text-muted-foreground",
};

const FILTERS = [
  { key: undefined, label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function statusPill(status: string, due: string) {
  const overdue = status !== "completed" && new Date(due) < new Date();
  if (overdue)
    return {
      cls: `${CLS.pill} bg-[#FCEBEB] text-[#A32D2D] dark:bg-[#501313] dark:text-[#F7C1C1]`,
      label: "overdue",
    };
  if (status === "completed")
    return {
      cls: `${CLS.pill} bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#173404] dark:text-[#C0DD97]`,
      label: "completed",
    };
  return {
    cls: `${CLS.pill} bg-[#FAEEDA] text-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775]`,
    label: "pending",
  };
}

function hasPenalty(p?: string) {
  return p && p !== "N/A" && p.trim() !== "";
}

function cardClass(item: ActionItem) {
  if (item.status === "completed") return CLS.cardDone;
  if (new Date(item.due) < new Date()) return CLS.cardOverdue;
  return CLS.card;
}

export default function ActionItemPage({
  data,
  status,
}: {
  data: ActionItem[];
  status?: string;
}) {
  console.log("data", data);
  const setFilter = useSetFilter();
  const [completing, setCompleting] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<ActionItem[]>(data);
  const activeFilter = (status ?? undefined) as FilterKey;

  useEffect(() => {
    setItems(data);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={CLS.empty}>
        <p className={CLS.emptyTitle}>No action items found.</p>
        <p className={CLS.emptySubtitle}>Action items from meetings will appear here.</p>
      </div>
    );
  }

  async function handleComplete(id: string) {
    setCompleting((prev) => new Set(prev).add(id));
    try {
      const res = await mettingAppAPI.markActionItemComplete(id);
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status: "completed" } : i)),
      );
      toast(`${res.data.response.title} completed`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCompleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const overdueCount = items?.filter(
    (i) => i?.status !== "completed" && new Date(i?.due) < new Date(),
  ).length;

  return (
    <div className={CLS.page}>
      {/* Header */}
      <div className={CLS.header}>
        <div>
          <h1 className={CLS.title}>Action items</h1>
          <p className={CLS.subtitle}>
            {items?.length} total
            {overdueCount > 0 && (
              <span className="text-[#A32D2D] dark:text-[#F7C1C1]">
                {" "}
                · {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={CLS.filterBar}>
        {FILTERS.map(({ key, label }, i) => (
          <React.Fragment key={label}>
            {i === FILTERS.length - 1 && <span className={CLS.separator} />}
            <button
              className={CLS.filterBtn(activeFilter === key)}
              onClick={() => setFilter("status", key as string)}
            >
              {label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* List */}
      {items?.length === 0 ? (
        <div className={CLS.empty}>No action items found.</div>
      ) : (
        items?.map((item) => {
          const { cls: pillCls, label: pillLabel } = statusPill(
            item.status,
            item.due,
          );
          const isDone = item.status === "completed";
          const isCompleting = completing.has(item._id);

          return (
            <div key={item._id} className={cardClass(item)}>
              <div className={CLS.topRow}>
                <p className={isDone ? CLS.descDone : CLS.desc}>{item.desc}</p>
                <span className={pillCls}>{pillLabel}</span>
              </div>

              <div className={CLS.metaRow}>
                {item.owner.map((o) => (
                  <span key={o._id} className={CLS.ownerChip}>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>
                      {o.username.slice(0, 2).toUpperCase()}
                    </span>
                    {o.username}
                  </span>
                ))}

                <span className={CLS.metaItem}>{formatDate(item.due)}</span>

                {hasPenalty(item.penalty) && (
                  <span className={CLS.penaltyChip}>{item.penalty}</span>
                )}

                {!isDone && (
                  <button
                    className={CLS.completeBtn}
                    onClick={() => handleComplete(item._id)}
                    disabled={isCompleting}
                  >
                    {isCompleting ? "Marking…" : "Mark complete"}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
