"use client";

import React, { useState } from "react";
import { Module } from "@/lib/module/moduleType";
import { moduleAppAPI } from "@/lib/module/moduleApi";
import Link from "next/link";

const CARD =
  "group relative rounded-lg border border-[#e0dfe3] bg-white dark:border-[#2a2740] dark:bg-[#141320] transition-shadow hover:shadow-md";

const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none";

const BADGE_GREEN = `${BADGE_BASE} bg-[#e8f5e9] text-[#2e7d32] dark:bg-[#1a3a1e] dark:text-[#66bb6a]`;
const BADGE_MUTED = `${BADGE_BASE} bg-[#f0eef4] text-[#80748d] dark:bg-[#1e1b30] dark:text-[#80748d]`;
const BADGE_SYSTEM = `${BADGE_BASE} bg-[#ede9ff] text-[#6c5fc7] dark:bg-[#1e1a3a] dark:text-[#a99de8]`;

const INPUT_BASE =
  "w-full rounded-md border border-[#e0dfe3] bg-[#f6f7f9] px-2.5 py-1.5 text-sm text-[#1d1c21] outline-none transition focus:border-[#6c5fc7] focus:ring-2 focus:ring-[#6c5fc7]/20 dark:border-[#2a2740] dark:bg-[#1a1825] dark:text-[#e0dfe3] dark:focus:border-[#8b7fe8]";

const BTN_PRIMARY =
  "inline-flex h-8 items-center gap-1.5 rounded-md bg-[#6c5fc7] px-3 text-xs font-medium text-white transition hover:bg-[#5a4eb5] active:scale-95 disabled:opacity-50";

const BTN_GHOST =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e0dfe3] bg-transparent px-3 text-xs font-medium text-[#80748d] transition hover:border-[#6c5fc7] hover:text-[#6c5fc7] dark:border-[#2a2740] dark:text-[#80748d]";

const TOGGLE_TRACK =
  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5fc7]";
// ─────────────────────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

interface ModuleCardProps {
  module: Module;
  onSave: (id: string, data: Partial<Module>) => Promise<void>;
}

function ModuleCard({ module, onSave }: ModuleCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Module>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const field = <K extends keyof Module>(key: K): Module[K] =>
    (draft[key] !== undefined ? draft[key] : module[key]) as Module[K];

  const patch = (updates: Partial<Module>) =>
    setDraft((prev) => ({ ...prev, ...updates }));

  const handleEdit = () => {
    setDraft({});
    setSaveState("idle");
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({});
    setSaveState("idle");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!Object.keys(draft).length) {
      setEditing(false);
      return;
    }
    setSaveState("saving");
    try {
      await onSave(module.key, draft);
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("idle");
        setEditing(false);
        setDraft({});
      }, 1000);
    } catch {
      setSaveState("error");
    }
  };

  const isActive = field("isActive");

  return (
    <div className={CARD}>
      {/* top accent strip */}
      <div
        className={`absolute inset-x-0 top-0 h-[3px] rounded-t-lg transition-colors ${
          isActive ? "bg-[#6c5fc7]" : "bg-[#e0dfe3] dark:bg-[#2a2740]"
        }`}
      />

      <div className="p-5 pt-6">
        {/* header row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                className={`${INPUT_BASE} mb-1 text-sm font-semibold`}
                value={field("name") as string}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Module name"
              />
            ) : (
              <p className="truncate text-sm font-semibold text-[#1d1c21] dark:text-[#e0dfe3]">
                {module.name}
              </p>
            )}

            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className={isActive ? BADGE_GREEN : BADGE_MUTED}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-[#4caf50]" : "bg-[#80748d]"
                  }`}
                />
                {isActive ? "Active" : "Inactive"}
              </span>
              {module.isSystem && <span className={BADGE_SYSTEM}>System</span>}
              <span className={BADGE_MUTED}>
                Order {field("order") as number}
              </span>
            </div>
          </div>

          {/* active toggle (always available) */}
          <button
            role="switch"
            aria-checked={isActive}
            onClick={() => {
              if (editing) {
                patch({ isActive: !isActive });
              } else {
                // quick toggle without entering full edit
                onSave(module.key, { isActive: !isActive });
                // optimistic — parent handles state
              }
            }}
            className={`${TOGGLE_TRACK} ${
              isActive ? "bg-[#6c5fc7]" : "bg-[#d1cde8] dark:bg-[#2a2740]"
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 translate-x-0 rounded-full bg-white shadow-sm transition-transform ${
                isActive ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>

        {/* description */}
        {editing ? (
          <textarea
            rows={2}
            className={`${INPUT_BASE} resize-none`}
            value={field("description") as string}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Description"
          />
        ) : (
          <p className="line-clamp-2 text-xs text-[#80748d] dark:text-[#6b637a]">
            {module.description || (
              <span className="italic opacity-50">No description</span>
            )}
          </p>
        )}

        {/* href */}
        {editing && (
          <div className="mt-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#80748d]">
              Path
            </label>
            <input
              className={INPUT_BASE}
              value={field("href") as string}
              onChange={(e) => patch({ href: e.target.value })}
              placeholder="/module/path"
            />
          </div>
        )}

        {/* order (editing only) */}
        {editing && (
          <div className="mt-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#80748d]">
              Order
            </label>
            <input
              type="number"
              min={0}
              className={INPUT_BASE}
              value={field("order") as number}
              onChange={(e) => patch({ order: Number(e.target.value) })}
            />
          </div>
        )}

        {/* departments */}
        {!editing && module.allowedDepartments?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(module.allowedDepartments as string[]).slice(0, 4).map((d) => (
              <span
                key={String(d)}
                className="rounded-md border border-[#e0dfe3] px-1.5 py-0.5 text-[10px] text-[#80748d] dark:border-[#2a2740]"
              >
                {String(d)}
              </span>
            ))}
            {module.allowedDepartments.length > 4 && (
              <span className="rounded-md border border-[#e0dfe3] px-1.5 py-0.5 text-[10px] text-[#80748d] dark:border-[#2a2740]">
                +{module.allowedDepartments.length - 4}
              </span>
            )}
          </div>
        )}

        {/* footer actions */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#e0dfe3] pt-3 dark:border-[#2a2740]">
          <span className="truncate font-mono text-[10px] text-[#80748d]">
            {module.key}
          </span>

          {!editing ? (
            <button onClick={handleEdit} className={BTN_GHOST}>
              <EditIcon />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {saveState === "error" && (
                <span className="text-[11px] text-red-500">Failed</span>
              )}
              {saveState === "saved" && (
                <span className="text-[11px] text-[#4caf50]">Saved!</span>
              )}
              <button onClick={handleCancel} className={BTN_GHOST}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveState === "saving"}
                className={BTN_PRIMARY}
              >
                {saveState === "saving" ? (
                  <>
                    <SpinnerIcon />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckIcon />
                    Save
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AllModule({ modules }: { modules: Module[] }) {
  const [items, setItems] = useState<Module[]>(modules);

  const handleSave = async (key: string, updatedData: Partial<Module>) => {
    setItems((prev) =>
      prev.map((m) => (m.key === key ? { ...m, ...updatedData } : m)),
    );
    try {
      await moduleAppAPI.updateModule(key, updatedData as Module);
    } catch (error) {
      setItems(modules);
      console.error("Error updating module:", error);
      throw error;
    }
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e0dfe3] bg-[#f6f7f9] py-16 text-center dark:border-[#2a2740] dark:bg-[#0e0c1a]">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#ede9ff] dark:bg-[#1e1a3a]">
          <ModulesIcon />
        </div>
        <p className="text-sm font-medium text-[#1d1c21] dark:text-[#e0dfe3]">
          No modules found
        </p>
        <p className="mt-1 text-xs text-[#80748d]">
          No modules have been configured yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-end">
        <Link href="/admin/settings/modules/create" className={BTN_PRIMARY}>
          Create Module
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((module) => (
          <ModuleCard key={module.key} module={module} onSave={handleSave} />
        ))}
      </div>
    </>
  );
}

export default AllModule;

// ── micro icons ───────────────────────────────────────────────────────────────
function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="animate-spin"
    >
      <path d="M8 1.5a6.5 6.5 0 1 0 6.5 6.5A.75.75 0 0 1 16 8a8 8 0 1 1-8-8 .75.75 0 0 1 0 1.5Z" />
    </svg>
  );
}

function ModulesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="#6c5fc7">
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5Zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5Zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5Zm8 0A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5Z" />
    </svg>
  );
}
