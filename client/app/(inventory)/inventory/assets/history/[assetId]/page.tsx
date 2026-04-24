"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { inventoryAPI } from "@/lib/inventoryApi";
import type { AssetHistory, AssetEventType } from "@/lib/inventoryTypes";
import {
  ChevronLeft,
  Calendar,
  User,
  MapPin,
  ArrowRight,
  Repeat2,
  UserPlus,
  Wrench,
  Trash2,
  CornerDownLeft,
} from "lucide-react";
import { format } from "date-fns";

const EVENT_META: Record<
  AssetEventType,
  {
    label: string;
    icon: React.ReactNode;
    dotCls: string;
    badgeCls: string;
  }
> = {
  ASSIGN: {
    label: "Assigned",
    icon: <UserPlus className="h-3 w-3" />,
    dotCls: "bg-blue-600",
    badgeCls: "bg-blue-50 text-blue-700",
  },
  TRANSFER: {
    label: "Transferred",
    icon: <Repeat2 className="h-3 w-3" />,
    dotCls: "bg-violet-500",
    badgeCls: "bg-violet-50 text-violet-700",
  },
  RETURN: {
    label: "Returned",
    icon: <CornerDownLeft className="h-3 w-3" />,
    dotCls: "bg-emerald-600",
    badgeCls: "bg-emerald-50 text-emerald-700",
  },
  MAINTENANCE: {
    label: "Maintenance",
    icon: <Wrench className="h-3 w-3" />,
    dotCls: "bg-amber-500",
    badgeCls: "bg-amber-50 text-amber-700",
  },
  DISPOSE: {
    label: "Disposed",
    icon: <Trash2 className="h-3 w-3" />,
    dotCls: "bg-rose-600",
    badgeCls: "bg-rose-50 text-rose-700",
  },
};

function formatDateTime(d: string) {
  try {
    return format(new Date(d), "MMM d, yyyy · HH:mm");
  } catch {
    return d;
  }
}

function resolveHolder(e: AssetHistory) {
  return e.toHolderSnapshot?.name ?? null;
}
function resolvePerformedBy(e: AssetHistory) {
  return e.performedBySnapshot?.name ?? null;
}

export default function AssetHistoryPage() {
  const params = useParams<{ assetId: string }>();
  const router = useRouter();
  const assetId = params?.assetId;
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) return;
    inventoryAPI
      .getAssetHistory(assetId)
      .then((d) => setHistory(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assetId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="h-7 w-7 rounded-full border-2 border-muted border-t-foreground animate-spin" />
        <p className="text-xs text-muted-foreground">Loading history…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[160px] gap-2 rounded-md border border-dashed">
          <Calendar className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">No history yet</p>
        </div>
      ) : (
        <div className="relative space-y-2.5">
          {/* vertical rule */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

          {history.map((event) => {
            const meta = EVENT_META[event.type] ?? EVENT_META.ASSIGN;
            const holder = resolveHolder(event);
            const performedBy = resolvePerformedBy(event);

            const details = [
              (event.fromStatus || event.toStatus) && {
                label: "Status",
                content: (
                  <div className="flex items-center gap-1 flex-wrap">
                    {event.fromStatus && (
                      <>
                        <span className="text-muted-foreground font-normal">
                          {event.fromStatus.replaceAll("_", " ")}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50 shrink-0" />
                      </>
                    )}
                    <span>{event.toStatus.replaceAll("_", " ")}</span>
                  </div>
                ),
              },
              (event.fromLocation || event.toLocation) && {
                label: "Location",
                content: (
                  <div className="flex items-center gap-1 flex-wrap">
                    <MapPin className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
                    {event.fromLocation && (
                      <>
                        <span className="text-muted-foreground font-normal">
                          {event.fromLocation}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50 shrink-0" />
                      </>
                    )}
                    {event.toLocation && <span>{event.toLocation}</span>}
                  </div>
                ),
              },
              holder && {
                label: "Assigned to",
                content: (
                  <div className="flex items-center gap-1">
                    <User className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
                    <span>{holder}</span>
                  </div>
                ),
              },
              performedBy && {
                label: "By",
                content: (
                  <div className="flex items-center gap-1">
                    <User className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
                    <span>{performedBy}</span>
                  </div>
                ),
              },
            ].filter(Boolean) as { label: string; content: React.ReactNode }[];

            return (
              <div key={event._id} className="relative flex gap-4">
                <div
                  className={`relative z-10 mt-[14px] h-[15px] w-[15px] shrink-0 rounded-full ring-2 ring-background ${meta.dotCls}`}
                />

                <div className="flex-1 border border-border rounded-[5px] bg-background overflow-hidden">
                  {/* top bar */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-[3px] ${meta.badgeCls}`}
                    >
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {formatDateTime(event.performedAt)}
                    </span>
                  </div>

                  {/* details row */}
                  {details.length > 0 && (
                    <div
                      className={`grid divide-x divide-border/60`}
                      style={{
                        gridTemplateColumns: `repeat(${details.length}, 1fr)`,
                      }}
                    >
                      {details.map((d) => (
                        <div key={d.label} className="px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground mb-1">
                            {d.label}
                          </p>
                          <div className="text-[12px] font-medium flex items-center gap-1">
                            {d.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* notes */}
                  {event.notes && (
                    <p className="mx-3 mb-2.5 mt-0 text-[11px] text-muted-foreground bg-muted/50 rounded-[3px] px-2.5 py-1.5">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
