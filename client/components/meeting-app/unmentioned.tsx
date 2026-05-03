"use client";
import React from "react";
import { AlertTriangle, UserPlus, X } from "lucide-react";
import { Attendee } from "./attendeesSection";

interface Props {
  /** Mentioned users not yet in the attendees list */
  unmentioned: Attendee[];
  onAdd: (attendee: Attendee) => void;
  onDismiss: (username: string) => void;
}

export default function UnmentionedWarning({
  unmentioned,
  onAdd,
  onDismiss,
}: Props) {
  if (unmentioned.length === 0) return null;

  return (
    <div className="space-y-2">
      {unmentioned.map((u) => (
        <div
          key={u.username}
          className="flex items-center gap-2 px-3 py-2 bg-[#fffbeb] dark:bg-[#231f0f] border border-[#f5e0a0] dark:border-[#4a3d10] rounded-md text-[13px] text-[#92700a] dark:text-[#c9a832]"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">
            <span className="font-medium">@{u.username}</span> is mentioned but
            not in the attendees list.
          </span>
          <button
            type="button"
            onClick={() => onAdd(u)}
            className="flex items-center gap-1 text-[12px] font-medium text-[#6c5fc7] hover:underline shrink-0"
          >
            <UserPlus className="h-3 w-3" />
            Add
          </button>
          <button
            type="button"
            onClick={() => onDismiss(u.username)}
            className="text-[#b0a8bb] hover:text-[#80748d] transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
