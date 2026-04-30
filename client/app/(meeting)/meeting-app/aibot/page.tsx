"use client";
import React, { useState, useEffect } from "react";
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

const DRAFT_KEY = "meeting_draft";

const inputCls =
  "w-full h-8 rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-3 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] placeholder:text-[#b0a8bb] dark:placeholder:text-[#5a5468] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/10";

const textareaCls =
  "w-full rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-3 py-2 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] placeholder:text-[#b0a8bb] dark:placeholder:text-[#5a5468] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/10 resize-none";

const labelCls = "text-[12px] font-medium text-[#3b3440] dark:text-[#a89cc0]";

const selectCls =
  "w-full h-8 rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-3 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] outline-none transition-all focus:border-[#6c5fc7] focus:ring-[3px] focus:ring-[#6c5fc7]/10";

function UseAiBot() {
  const [description, setDescription] = useState("");
  const [mentions, setMentions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [meetingData, setMeetingData] = useState<any>(null);
  const [actionItemsData, setActionItemsData] = useState<any[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const { meetingData, actionItemsData, description } = JSON.parse(saved);
      if (meetingData) {
        setMeetingData(meetingData);
        setActionItemsData(actionItemsData || []);
        setDraftRestored(true);
        toast.info("Restored your unsaved meeting draft.");
      }
      if (description) setDescription(description);
    }
  }, []);

  useEffect(() => {
    if (!meetingData && !description) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ meetingData, actionItemsData, description }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [meetingData, actionItemsData, description]);

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
        "http://102.36.135.18:3000/n8n/webhook-test/test",
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
            date: new Date().toISOString().split("T")[0],
          }),
        },
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      const processed = Array.isArray(data) ? data[0] : data;
      const { actionItems, ...rest } = processed;
      setMeetingData(rest);
      setActionItemsData(actionItems || []);
    } catch {
      setError("Failed to process meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      // Normalize attendees → [{ user, username }]
      const normalizedAttendees = (meetingData.attendees || []).map(
        (a: any) => {
          if (typeof a === "object" && a.user) return a;
          const username = typeof a === "object" ? a.username || "" : String(a);
          const id = mentions[username] || "";
          return { user: id, username };
        },
      );

      // Normalize action item owners → [{ user, username }]
      const normalizedActionItems = actionItemsData.map((item) => ({
        ...item,
        owner: (() => {
          if (Array.isArray(item.owner) && item.owner.length > 0)
            return item.owner;
          if (typeof item.owner === "object" && item.owner?.user)
            return [item.owner];
          const username =
            typeof item.owner === "string"
              ? item.owner.replace("@", "").trim()
              : "";
          const id = mentions[username] || "";
          return username ? [{ user: id, username }] : [];
        })(),
      }));

      await mettingAppAPI.createMeeting({
        meetingData: { ...meetingData, attendees: normalizedAttendees },
        actionItemsData: normalizedActionItems,
      });

      toast("Meeting submitted successfully!");
      localStorage.removeItem(DRAFT_KEY);
      setMeetingData(null);
      setActionItemsData([]);
      setDescription("");
      setMentions({});
      setDraftRestored(false);
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
    setError("");
    setDraftRestored(false);
  };

  const get = (field: string) => meetingData?.[field] || "";

  const Subcard = ({
    title,
    subtitle,
    action,
    children,
  }: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
  }) => (
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
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fff5f5] dark:bg-[#2d1a1a] border border-[#f8d0d0] dark:border-[#5c2a2a] rounded-md text-[13px] text-[#c93a3a] mb-4">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Draft restored banner */}
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

            {/* ── Step 1: Input ── */}
            {!meetingData ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Meeting Notes</label>
                  {/* <TextArea
                    value={description}
                    rows={10}
                    className={`${textareaCls} font-mono`}
                    placeholder="Paste your meeting notes here, @mention attendees..."
                    onChange={(value, updatedMentions) => {
                      setDescription(value);
                      setMentions(updatedMentions);
                      if (error) setError("");
                    }}
                  /> */}
                  <span className="text-[12px] text-[#80748d] dark:text-[#6b6080] text-right">
                    {description.length} characters
                  </span>
                </div>
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
              /* ── Step 2: Review ── */
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
                    {/* Title, Department, Date */}
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

                    {/* Attendees */}
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>
                        Attendees (comma-separated)
                      </label>
                      <textarea
                        rows={2}
                        value={
                          Array.isArray(get("attendees"))
                            ? get("attendees")
                                .map((a: any) =>
                                  typeof a === "object" ? a.username : a,
                                )
                                .join(", ")
                            : get("attendees")
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                            .map((username) => {
                              const existing = Array.isArray(get("attendees"))
                                ? get("attendees").find(
                                    (a: any) => a.username === username,
                                  )
                                : null;
                              return (
                                existing || {
                                  user: mentions[username] || "",
                                  username,
                                }
                              );
                            });
                          handleFieldChange("attendees", val);
                        }}
                        placeholder="Mr. John, Mrs. Smith"
                        className={textareaCls}
                      />
                    </div>

                    {/* Agenda & Minutes */}
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
                            {/* Owner */}
                            <div className="flex flex-col gap-1.5">
                              <label className={labelCls}>Owner</label>
                              <input
                                type="text"
                                value={
                                  Array.isArray(item.owner)
                                    ? item.owner
                                        .map((o: any) => o.username)
                                        .join(", ")
                                    : typeof item.owner === "object" &&
                                        item.owner !== null
                                      ? item.owner.username || ""
                                      : item.owner || ""
                                }
                                onChange={(e) => {
                                  const username = e.target.value
                                    .replace("@", "")
                                    .trim();
                                  const id = mentions[username] || "";
                                  handleActionItemChange(i, "owner", [
                                    { user: id, username },
                                  ]);
                                }}
                                placeholder="Assign owner..."
                                className={inputCls}
                              />
                            </div>

                            {/* Due Date */}
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
                            {/* Status */}
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

                            {/* Penalty */}
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
              "Specify penalties clearly when mentioned",
              "List all attendees explicitly",
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
