"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { MeetingPreview } from "@/lib/meeting/meetingAppTypes";

interface Props {
  meetings: MeetingPreview[];
  nextCursor: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon?: React.ElementType }
> = {
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    icon: Clock,
  },
  ongoing: {
    label: "In Progress",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-500/10",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
};

export default function MeetingPreviewCard({ meetings }: Props) {
  const now = new Date();

  return (
    <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {meetings.map((meeting) => {
        const meetingDate = new Date(meeting.date);
        const isPast = meetingDate < now;
        const isToday = meetingDate.toDateString() === now.toDateString();
        const status = statusConfig[meeting.status] || statusConfig.scheduled;

        return (
          <Link
            key={meeting._id}
            href={`/meeting-app/meeting/${meeting._id}`}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 rounded-xl"
          >
            <div
              className="
                relative
                border border-zinc-200 dark:border-zinc-800/60
                bg-white dark:bg-zinc-900 
                hover:bg-zinc-50 dark:hover:from-zinc-800/60 dark:hover:to-zinc-900/50
                hover:border-zinc-300 dark:hover:border-zinc-700
                active:scale-[0.98]
                transition-all duration-200
                rounded-xl
                p-5
                shadow-sm dark:shadow-lg
                backdrop-blur-sm
                overflow-hidden
                group-focus-visible:ring-2
                group-focus-visible:ring-blue-500
              "
            >
              {/* Decorative gradient line - top */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Header Section */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-white line-clamp-2 transition-colors">
                      {meeting.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${status.bg} border ${status.color.replace("text", "border")}/10`}
                      >
                        {status.icon && (
                          <status.icon className={`h-3 w-3 ${status.color}`} />
                        )}
                        <span
                          className={`text-[11px] font-medium uppercase tracking-wide ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {isToday && !isPast && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-medium border border-green-200 dark:border-green-500/20">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Department badge with icon */}
                  <div className="shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
                      <Users className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {meeting.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent" />

              {/* Footer Section with enhanced date display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {format(meetingDate, "EEE, MMM d")}
                      {isToday && !isPast && (
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          • Today
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-800" />

                  <div className="flex items-center gap-1.5">
                    <Clock
                      className={`h-3.5 w-3.5 ${
                        isPast
                          ? "text-zinc-400 dark:text-zinc-600"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isPast
                          ? "text-zinc-500 dark:text-zinc-500"
                          : isToday
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {isPast ? "Ended" : isToday ? "Today" : "Upcoming"}
                    </span>
                  </div>
                </div>

                {/* Chevron icon - appears on hover */}
                <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all duration-200 opacity-0 group-hover:opacity-100" />
              </div>

              {/* Time indicator for today's meetings */}
              {isToday && !isPast && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/80 via-blue-500/40 to-transparent" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
