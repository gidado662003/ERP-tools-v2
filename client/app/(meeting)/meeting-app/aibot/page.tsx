"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ClipboardList,
  Plus,
  Trash2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { mettingAppAPI } from "@/lib/meeting/mettingAppApi";
import { toast } from "sonner";
import TextArea from "@/components/meeting-app/textArea";
import AttendeeSelector, {
  Attendee,
} from "@/components/meeting-app/attendeesSection";
import UnmentionedWarning from "@/components/meeting-app/unmentioned";

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAFT_KEY = "meeting_draft";

const inputCls =
  "w-full h-8 rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-3 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] placeholder:text-[#b0a8bb] dark:placeholder:text-[#5a5468] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/10";

const textareaCls =
  "w-full rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-3 py-2 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] placeholder:text-[#b0a8bb] dark:placeholder:text-[#5a5468] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/10 resize-none";

const labelCls = "text-[12px] font-medium text-[#3b3440] dark:text-[#a89cc0]";

const selectCls =
  "w-full h-8 rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-3 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeAttendee(a: any): Attendee {
  if (typeof a === "object" && a.user !== undefined) return a;
  return { user: a._id || "", username: a.username || String(a) };
}

function normalizeOwner(owner: any): Attendee[] {
  if (Array.isArray(owner)) return owner.map(normalizeAttendee);
  if (typeof owner === "object" && owner !== null)
    return [normalizeAttendee(owner)];
  return [];
}

// ─── Subcard ──────────────────────────────────────────────────────────────────

function Subcard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#e0dfe3] dark:border-[#2a2535] rounded-md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0dfe3] dark:border-[#2a2535]">
        <div>
          <p className="text-[13px] font-semibold text-[#1d1c21] dark:text-[#e4e0f0]">
            {title}
          </p>
          {subtitle && (
            <p className="text-[12px] text-[#80748d] dark:text-[#6b6080] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function UseAiBot() {
  const [description, setDescription] = useState("");
  // mentions map: username → id, populated by TextArea's @mention lookup
  const [mentions, setMentions] = useState<Record<string, string>>({});
  // attendees explicitly selected before parsing
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  // usernames the user dismissed from the unmentioned warning
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(
    new Set(),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [meetingData, setMeetingData] = useState<any>(null);
  const [actionItemsData, setActionItemsData] = useState<any[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);

  // ── Draft restore ──
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.meetingData) {
          setMeetingData(parsed.meetingData);
          setActionItemsData(parsed.actionItemsData || []);
          setDraftRestored(true);
          toast.info("Restored your unsaved meeting draft.");
        }
        if (parsed.description) setDescription(parsed.description);
        if (parsed.attendees) setAttendees(parsed.attendees);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!meetingData && !description && attendees.length === 0) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          meetingData,
          actionItemsData,
          description,
          attendees,
        }),
      );
    }, 7000);
    return () => clearTimeout(timer);
  }, [meetingData, actionItemsData, description, attendees]);

  const searchUsers = useCallback(
    async (query: string): Promise<Attendee[]> => {
      try {
        const res = await fetch(
          `
http://localhost:5001/api/user?search=${encodeURIComponent(query)}`,
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data.users || data || []).map(normalizeAttendee);
      } catch {
        return [];
      }
    },
    [],
  );

  const unmentionedUsers: Attendee[] = Object.entries(mentions)
    .filter(([username]) => {
      const inAttendees = attendees.some((a) => a.username === username);
      const dismissed = dismissedWarnings.has(username);
      return !inAttendees && !dismissed;
    })
    .map(([username, id]) => ({ user: id, username }));

  const handleAddFromWarning = (attendee: Attendee) => {
    setAttendees((prev) => [...prev, attendee]);
  };

  const handleDismissWarning = (username: string) => {
    setDismissedWarnings((prev) => new Set([...prev, username]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter meeting notes.");
      return;
    }
    setIsLoading(true);
    setError("");
    setMeetingData(null);
    setActionItemsData([]);
    try {
      const response = await fetch(
        "https://gidado.app.n8n.cloud/webhook-test/test",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: {
              body: description,
              mentions: Object.entries(mentions).map(([username, id]) => ({
                username,
                id,
              })),
            },
            attendees,
            date: new Date().toISOString().split("T")[0],
          }),
        },
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      const processed = Array.isArray(data) ? data[0] : data;
      const { actionItems, ...rest } = processed;

      // Merge AI-returned attendees with the ones explicitly selected,
      // preferring explicit selections (which carry resolved IDs)
      const aiAttendees: Attendee[] = (rest.attendees || []).map(
        normalizeAttendee,
      );
      const mergedAttendees = [...attendees];
      aiAttendees.forEach((ai) => {
        if (!mergedAttendees.some((a) => a.username === ai.username)) {
          mergedAttendees.push(ai);
        }
      });

      setMeetingData({ ...rest, attendees: mergedAttendees });
      setActionItemsData(
        (actionItems || []).map((item: any) => ({
          ...item,
          owner: normalizeOwner(item.owner),
        })),
      );
    } catch {
      setError("Failed to process meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Field helpers ──
  const handleFieldChange = (field: string, value: any) =>
    setMeetingData((prev: any) => ({ ...prev, [field]: value }));

  const handleActionItemChange = (index: number, field: string, value: any) =>
    setActionItemsData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

  const addActionItem = () =>
    setActionItemsData((prev) => [
      ...prev,
      {
        desc: "",
        penalty: "N/A",
        owner: [],
        due: new Date().toISOString().split("T")[0],
        status: "pending",
      },
    ]);

  const removeActionItem = (index: number) =>
    setActionItemsData((prev) => prev.filter((_, i) => i !== index));

  // ── Final submit ──
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await mettingAppAPI.createMeeting({ meetingData, actionItemsData });
      toast("Meeting submitted successfully!");
      localStorage.removeItem(DRAFT_KEY);
      resetForm();
    } catch {
      setError("Failed to submit meeting data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    localStorage.removeItem(DRAFT_KEY);
    setMeetingData(null);
    setActionItemsData([]);
    setDescription("");
    setMentions({});
    setAttendees([]);
    setDismissedWarnings(new Set());
    setError("");
    setDraftRestored(false);
  };

  const get = (field: string) => meetingData?.[field] ?? "";

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-start">
        {/* ── Main card ── */}
        <div className="bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-[#2a2535] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="px-5 pt-5">
            <h1 className="text-[15px] font-semibold text-[#1d1c21] dark:text-[#e4e0f0] flex items-center gap-2 tracking-tight">
              <ClipboardList className="h-4 w-4 text-[#6c5fc7]" />
              AI Meeting Parser
            </h1>
            <p className="text-[13px] text-[#80748d] dark:text-[#6b6080] mt-0.5">
              Convert meeting notes into structured meeting data.
            </p>
            <div className="mt-4 border-t border-[#e0dfe3] dark:border-[#2a2535]" />
          </div>

          <div className="p-5">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fff5f5] dark:bg-[#2d1a1a] border border-[#f8d0d0] dark:border-[#5c2a2a] rounded-md text-[13px] text-[#c93a3a] mb-4">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {draftRestored && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#faf8ff] dark:bg-[#1e1a2e] border border-[#d4cef5] dark:border-[#3d3560] rounded-md text-[13px] text-[#6c5fc7] mb-4">
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                Draft restored from your last session.
                <button
                  onClick={resetForm}
                  className="ml-auto text-[12px] underline underline-offset-2 opacity-80 hover:opacity-100"
                >
                  Discard
                </button>
              </div>
            )}

            {/* ══ Step 1: Input ══ */}
            {!meetingData ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Attendees selector */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>
                    Attendees
                    {attendees.length > 0 && (
                      <span className="ml-1.5 text-[11px] font-normal text-[#80748d] dark:text-[#6b6080]">
                        {attendees.length} selected
                      </span>
                    )}
                  </label>
                  <AttendeeSelector
                    value={attendees}
                    onChange={setAttendees}
                    searchUsers={searchUsers}
                  />
                </div>

                {/* Meeting notes */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Meeting Notes</label>
                  <TextArea
                    value={description}
                    rows={10}
                    className={`${textareaCls} font-mono`}
                    placeholder="Paste your meeting notes here, @mention attendees..."
                    onChange={(value, updatedMentions) => {
                      setDescription(value);
                      setMentions(updatedMentions);
                      if (error) setError("");
                    }}
                  />
                  <span className="text-[12px] text-[#80748d] dark:text-[#6b6080] text-right">
                    {description.length} characters
                  </span>
                </div>

                {/* Unmentioned warnings */}
                <UnmentionedWarning
                  unmentioned={unmentionedUsers}
                  onAdd={handleAddFromWarning}
                  onDismiss={handleDismissWarning}
                />

                <button
                  type="submit"
                  disabled={isLoading || !description.trim()}
                  className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-[#6c5fc7] text-[13px] font-medium text-white transition-colors hover:bg-[#5c4eb5] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing
                      Meeting...
                    </>
                  ) : (
                    "Parse Meeting Notes"
                  )}
                </button>
              </form>
            ) : (
              /* ══ Step 2: Review ══ */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#1d1c21] dark:text-[#e4e0f0]">
                    Review & Edit Meeting Data
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="h-8 px-3 flex items-center gap-2 rounded-md bg-[#2a7d4f] text-[13px] font-medium text-white hover:bg-[#236040] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        "Submit Meeting"
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      className="h-8 px-3 rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] text-[13px] font-medium text-[#3b3440] dark:text-[#c4bcd8] hover:bg-[#f6f6f7] dark:hover:bg-[#221f30] transition-colors"
                    >
                      New Meeting
                    </button>
                  </div>
                </div>

                {/* Meeting Details */}
                <Subcard title="Meeting Details">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          label: "Meeting Title",
                          field: "title",
                          placeholder: "e.g., Q3 Review",
                        },
                        {
                          label: "Department",
                          field: "department",
                          placeholder: "e.g., Engineering",
                        },
                        { label: "Date", field: "date", type: "date" },
                      ].map(({ label, field, type, placeholder }) => (
                        <div key={field} className="flex flex-col gap-1.5">
                          <label className={labelCls}>{label}</label>
                          <input
                            type={type || "text"}
                            value={get(field)}
                            onChange={(e) =>
                              handleFieldChange(field, e.target.value)
                            }
                            placeholder={placeholder}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Attendees — chip picker in edit mode */}
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>
                        Attendees
                        {(get("attendees") as Attendee[]).length > 0 && (
                          <span className="ml-1.5 text-[11px] font-normal text-[#80748d] dark:text-[#6b6080]">
                            {(get("attendees") as Attendee[]).length} selected
                          </span>
                        )}
                      </label>
                      <AttendeeSelector
                        value={get("attendees") as Attendee[]}
                        onChange={(updated) =>
                          handleFieldChange("attendees", updated)
                        }
                        searchUsers={searchUsers}
                      />
                    </div>

                    {[
                      { label: "Agenda", field: "agenda", rows: 3 },
                      { label: "Minutes", field: "minutes", rows: 4 },
                    ].map(({ label, field, rows }) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label className={labelCls}>{label}</label>
                        <textarea
                          rows={rows}
                          value={get(field)}
                          onChange={(e) =>
                            handleFieldChange(field, e.target.value)
                          }
                          className={textareaCls}
                        />
                      </div>
                    ))}
                  </div>
                </Subcard>

                {/* Action Items */}
                <Subcard
                  title="Action Items"
                  subtitle="Tasks and assignments from the meeting"
                  action={
                    <button
                      onClick={addActionItem}
                      className="h-7 px-2.5 flex items-center gap-1.5 rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] text-[12px] font-medium text-[#3b3440] dark:text-[#c4bcd8] hover:bg-[#f6f6f7] dark:hover:bg-[#221f30] transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  }
                >
                  {actionItemsData.length === 0 ? (
                    <p className="text-center text-[13px] text-[#80748d] dark:text-[#6b6080] py-5">
                      No action items yet. Click "Add Item" to create one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {actionItemsData.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="border border-[#e0dfe3] dark:border-[#2a2535] rounded-md p-3 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#80748d] dark:text-[#6b6080] uppercase tracking-wider">
                              Item #{i + 1}
                            </span>
                            <button
                              onClick={() => removeActionItem(i)}
                              className="p-1 rounded text-[#c93a3a] hover:bg-[#fff5f5] dark:hover:bg-[#2d1a1a] transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Description</label>
                            <textarea
                              rows={2}
                              value={item.desc || ""}
                              onChange={(e) =>
                                handleActionItemChange(
                                  i,
                                  "desc",
                                  e.target.value,
                                )
                              }
                              placeholder="Describe the action item..."
                              className={textareaCls}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Owner — chip picker backed by meeting attendees */}
                            <div className="flex flex-col gap-1.5">
                              <label className={labelCls}>Owner</label>
                              <AttendeeSelector
                                value={item.owner as Attendee[]}
                                onChange={(updated) =>
                                  handleActionItemChange(i, "owner", updated)
                                }
                                searchUsers={async (q) => {
                                  // Search within attendees first, then fall back to API
                                  const currentAttendees = get(
                                    "attendees",
                                  ) as Attendee[];
                                  const local = currentAttendees.filter((a) =>
                                    a.username
                                      .toLowerCase()
                                      .includes(q.toLowerCase()),
                                  );
                                  if (local.length > 0) return local;
                                  return searchUsers(q);
                                }}
                                placeholder="Assign owner…"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className={labelCls}>Due Date</label>
                              <input
                                type="date"
                                value={item.due || ""}
                                onChange={(e) =>
                                  handleActionItemChange(
                                    i,
                                    "due",
                                    e.target.value,
                                  )
                                }
                                className={inputCls}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className={labelCls}>Status</label>
                              <select
                                value={item.status || "pending"}
                                onChange={(e) =>
                                  handleActionItemChange(
                                    i,
                                    "status",
                                    e.target.value,
                                  )
                                }
                                className={selectCls}
                              >
                                <option value="pending">Pending</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className={labelCls}>Penalty</label>
                              <input
                                value={item.penalty || "N/A"}
                                onChange={(e) =>
                                  handleActionItemChange(
                                    i,
                                    "penalty",
                                    e.target.value,
                                  )
                                }
                                placeholder="N/A"
                                className={inputCls}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Subcard>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="bg-white dark:bg-[#141320] border border-[#e0dfe3] dark:border-[#2a2535] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] sticky top-6">
          <div className="px-4 pt-4">
            <h2 className="text-[13px] font-semibold text-[#1d1c21] dark:text-[#e4e0f0]">
              Formatting Guide
            </h2>
            <p className="text-[12px] text-[#80748d] dark:text-[#6b6080] mt-0.5">
              Tips for best results
            </p>
            <div className="mt-3 border-t border-[#e0dfe3] dark:border-[#2a2535]" />
          </div>
          <ul className="p-4 space-y-2">
            {[
              "Use full dates (e.g., October 15, 2025)",
              "Include titles before names (Mr, Mrs)",
              "@mention attendees directly in notes",
              "Select attendees above before parsing",
              "Specify penalties clearly when mentioned",
              "Use numbered points for action items",
            ].map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-[13px] text-[#3b3440] dark:text-[#a89cc0] leading-snug"
              >
                <span className="text-[#6c5fc7] font-bold mt-px">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UseAiBot;
