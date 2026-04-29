"use client";
import React, { useEffect, useState } from "react";
import { mettingAppAPI } from "@/lib/meeting/mettingAppApi";
import { useParams } from "next/navigation";
import {
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Edit3,
} from "lucide-react";

interface ActionItem {
  _id: string;
  desc: string;
  penalty: string;
  owner: string;
  due: string;
  status: "pending" | "completed" | "overdue";
}

interface Meeting {
  _id: string;
  title: string;
  date: string;
  attendees: string[];
  agenda: string;
  minutes: string;
  department: string;
  actionItems: ActionItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES = {
  completed:
    "bg-[#eaf3de] dark:bg-[#1a3010] text-[#3b6d11] dark:text-[#8fcf52] border border-[#c0dd97] dark:border-[#3b6d11]",
  pending:
    "bg-[#faeeda] dark:bg-[#2e1f08] text-[#854f0b] dark:text-[#e8a840] border border-[#fac775] dark:border-[#854f0b]",
  overdue:
    "bg-[#fcebeb] dark:bg-[#2d1010] text-[#a32d2d] dark:text-[#e87070] border border-[#f7c1c1] dark:border-[#a32d2d]",
};

const STATUS_ICONS = {
  completed: <CheckCircle2 className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  overdue: <AlertCircle className="h-3 w-3" />,
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-[#2a2535] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  icon,
  right,
}: {
  title: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0dfe3] dark:border-[#2a2535]">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1c21] dark:text-[#e4e0f0]">
        <span className="text-[#6c5fc7]">{icon}</span>
        {title}
      </div>
      {right}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-[#f6f6f7] dark:bg-[#1a1825] border border-[#e0dfe3] dark:border-[#3a3540] rounded-md px-3 py-2">
      <span className="text-[#6c5fc7]">{icon}</span>
      <div>
        <p className="text-[11px] text-[#80748d] dark:text-[#6b6080]">
          {label}
        </p>
        <p className="text-[13px] font-600 text-[#1d1c21] dark:text-[#e4e0f0]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionCard({ item, index }: { item: ActionItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#e0dfe3] dark:border-[#2a2535] rounded-md overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full text-left p-3 hover:bg-[#faf9ff] dark:hover:bg-[#1e1a2e] transition-colors"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="w-5 h-5 rounded-full bg-[#6c5fc7] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#80748d] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        <p className="text-[13px] font-medium text-[#1d1c21] dark:text-[#e4e0f0] leading-snug mb-2.5">
          {item.desc}
        </p>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[item.status]}`}
          >
            {STATUS_ICONS[item.status]}
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
          <span className="text-[12px] text-[#80748d] dark:text-[#6b6080]">
            {item.owner}
          </span>
          <span className="text-[12px] text-[#80748d] dark:text-[#6b6080]">
            Due {formatDate(item.due)}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#e0dfe3] dark:border-[#2a2535] px-3 py-2.5 bg-[#faf9fb] dark:bg-[#1a1825] space-y-1.5">
          {[
            { label: "Task ID", value: item._id, mono: true },
            { label: "Penalty", value: item.penalty || "—" },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between text-[12px]">
              <span className="text-[#80748d] dark:text-[#6b6080]">
                {label}
              </span>
              <span
                className={`text-[#1d1c21] dark:text-[#e4e0f0] font-medium ${mono ? "font-mono text-[11px] text-[#6c5fc7]" : ""}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Page() {
  const { id } = useParams();
  const [data, setData] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await mettingAppAPI.getMeetingsById(id);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f7] dark:bg-[#0e0c1a]">
        <div className="h-8 w-8 rounded-full border-2 border-[#e0dfe3] dark:border-[#2a2535] border-t-[#6c5fc7] animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[13px] text-[#80748d] dark:text-[#6b6080]">
        Failed to load meeting.
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-4">
      {/* Meta bar */}
      <Card>
        <div className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-[#1d1c21] dark:text-[#e4e0f0] tracking-tight">
              {data.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#eeedfe] dark:bg-[#26215c] text-[#534ab7] dark:text-[#cecbf6] border border-[#afa9ec] dark:border-[#3c3489]">
                {data.department}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#f1efe8] dark:bg-[#2c2c2a] text-[#5f5e5a] dark:text-[#d3d1c7] border border-[#d3d1c7] dark:border-[#444441] capitalize">
                {data.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <InfoTile
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Meeting Date"
              value={formatDate(data.date)}
            />
            <InfoTile
              icon={<Users className="h-3.5 w-3.5" />}
              label="Attendees"
              value={`${data.attendees.length} participants`}
            />
          </div>
        </div>
      </Card>

      {/* Attendees */}
      <Card>
        <CardHeader
          title="Attendees"
          icon={<Users className="h-3.5 w-3.5" />}
        />
        <div className="p-4 flex flex-wrap gap-2">
          {data.attendees.map((a) => (
            <span
              key={a}
              className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-[#eeedfe] dark:bg-[#1e1a2e] text-[#534ab7] dark:text-[#a89cc0] border border-[#d4cef5] dark:border-[#3d3560]"
            >
              {a}
            </span>
          ))}
        </div>
      </Card>

      {/* Agenda + Minutes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Agenda"
            icon={<FileText className="h-3.5 w-3.5" />}
          />
          <div className="p-4">
            <p className="text-[13px] text-[#3b3440] dark:text-[#a89cc0] leading-relaxed whitespace-pre-line">
              {data.agenda || "No agenda provided."}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Minutes"
            icon={<Edit3 className="h-3.5 w-3.5" />}
          />
          <div className="p-4 max-h-52 overflow-y-auto">
            <p className="text-[13px] text-[#3b3440] dark:text-[#a89cc0] leading-relaxed whitespace-pre-line">
              {data.minutes || "No minutes recorded."}
            </p>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader
          title="Action Items"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          right={
            <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#eeedfe] dark:bg-[#1e1a2e] text-[#534ab7] dark:text-[#a89cc0] border border-[#d4cef5] dark:border-[#3d3560]">
              {data.actionItems.length} tasks
            </span>
          }
        />
        <div className="p-4">
          {data.actionItems.length === 0 ? (
            <p className="text-center text-[13px] text-[#80748d] dark:text-[#6b6080] py-8">
              No action items created yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {data.actionItems.map((item, i) => (
                <ActionCard key={item._id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Page;
