"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Search, Loader2 } from "lucide-react";

export interface Attendee {
  user: string;
  username: string;
}

interface Props {
  value: Attendee[];
  onChange: (attendees: Attendee[]) => void;
  /** Pass the same lookup fn your TextArea uses for @mentions */
  searchUsers: (query: string) => Promise<Attendee[]>;
  placeholder?: string;
  className?: string;
}

const inputCls =
  "flex-1 min-w-[120px] h-7 bg-transparent text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] placeholder:text-[#b0a8bb] dark:placeholder:text-[#5a5468] outline-none";

export default function AttendeeSelector({
  value,
  onChange,
  searchUsers,
  placeholder = "Search and add attendees…",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Attendee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const data = await searchUsers(q);
          const selectedIds = new Set(value.map((a) => a.user || a.username));

          setResults(
            data.filter((u) => !selectedIds.has(u.user || u.username)),
          );
          setOpen(true);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [searchUsers, value],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const select = (attendee: Attendee) => {
    onChange([...value, attendee]);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Remove last chip on backspace when input is empty
    if (e.key === "Backspace" && !query && value.length > 0) {
      remove(value.length - 1);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input area */}
      <div
        className="min-h-9 w-full flex flex-wrap gap-1.5 items-center rounded-md border border-[#e0dfe3] dark:border-[#3a3540] bg-white dark:bg-[#1a1825] px-2.5 py-1.5 transition-all focus-within:border-[#6c5fc7] focus-within:ring-[3px] focus-within:ring-[#6c5fc7]/10 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((a, i) => (
          <span
            key={a.user || a.username}
            className="inline-flex items-center gap-1 h-6 px-2 rounded bg-[#f0eefb] dark:bg-[#2a2245] text-[12px] font-medium text-[#6c5fc7] dark:text-[#a99de0]"
          >
            @{a.username}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
              className="text-[#9d8fd4] dark:text-[#7a6fb5] hover:text-[#6c5fc7] transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1.5 flex-1">
          <Search className="h-3.5 w-3.5 text-[#b0a8bb] dark:text-[#5a5468] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setOpen(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            className={inputCls}
          />
          {isSearching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#b0a8bb] shrink-0" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#1e1b2e] border border-[#e0dfe3] dark:border-[#3a3540] rounded-md shadow-md overflow-hidden">
          {results.map((u) => (
            <button
              key={u.user || u.username}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                select(u);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#1d1c21] dark:text-[#e4e0f0] hover:bg-[#f6f5ff] dark:hover:bg-[#2a2245] transition-colors text-left"
            >
              <span className="w-6 h-6 rounded-full bg-[#e0defe] dark:bg-[#2a2245] flex items-center justify-center text-[11px] font-semibold text-[#6c5fc7]">
                {u.username.charAt(0).toUpperCase()}
              </span>
              @{u.username}
            </button>
          ))}
        </div>
      )}

      {open && !isSearching && query && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#1e1b2e] border border-[#e0dfe3] dark:border-[#3a3540] rounded-md shadow-md px-3 py-2.5 text-[13px] text-[#80748d] dark:text-[#6b6080]">
          No users found for "{query}"
        </div>
      )}
    </div>
  );
}
