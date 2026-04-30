"use client";
import React, { useState, useRef } from "react";
import UserSelect from "@/components/userSelect";

interface TextAreaProps {
  value: string;
  onChange: (value: string, mentions: Record<string, string>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

function TextArea({
  value,
  onChange,
  placeholder = "Write a message, type @ to mention...",
  rows = 10,
  className = "",
}: TextAreaProps) {
  const [search, setSearch] = useState("");
  const [mentions, setMentions] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart ?? newValue.length;

    // Clean up stale mentions
    const updatedMentions = { ...mentions };
    for (const username of Object.keys(updatedMentions)) {
      if (!newValue.includes(`@${username}`)) {
        delete updatedMentions[username];
      }
    }
    setMentions(updatedMentions);

    const textUpToCursor = newValue.slice(0, cursorPos);
    const match = textUpToCursor.match(/@(\w*)$/);
    setSearch(match ? match[1] : "");

    onChange(newValue, updatedMentions);
  };

  const handleSelect = (username: string, userId: string) => {
    const cursorPos = textareaRef.current?.selectionStart ?? value.length;
    const textUpToCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const newBefore = textUpToCursor.replace(/@(\w*)$/, `@${username} `);
    const newValue = newBefore + textAfterCursor;

    const updatedMentions = { ...mentions, [username]: userId };
    setMentions(updatedMentions);
    setSearch("");

    onChange(newValue, updatedMentions);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newBefore.length;
        textareaRef.current.selectionEnd = newBefore.length;
        textareaRef.current.focus();
      }
    });
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      <UserSelect search={search} onSelect={handleSelect} />
    </div>
  );
}

export default TextArea;
