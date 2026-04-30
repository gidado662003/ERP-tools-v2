"use client";
import React, { useState, useRef } from "react";
import UserSelect from "@/components/userSelect";
import { Textarea } from "@/components/ui/textarea";
function page() {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [mentions, setMentions] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? value.length;

    setInputValue(value);

    // Only look at text up to the cursor, not the full string
    const textUpToCursor = value.slice(0, cursorPos);
    const match = textUpToCursor.match(/@(\w*)$/);
    setSearch(match ? match[1] : "");
  };
  // select
  const handleSelect = (username: string, userId: string) => {
    const cursorPos = textareaRef.current?.selectionStart ?? inputValue.length;
    const textUpToCursor = inputValue.slice(0, cursorPos);
    const textAfterCursor = inputValue.slice(cursorPos);
    const newBefore = textUpToCursor.replace(/@(\w*)$/, `@${username} `);
    const newValue = newBefore + textAfterCursor;

    setInputValue(newValue);
    setMentions((prev) => ({ ...prev, [username]: userId }));
    setSearch("");
  };

  const handleSubmit = async () => {
    const resolvedMentions = Object.entries(mentions)
      .filter(([username]) => inputValue.includes(`@${username}`))
      .map(([username, id]) => ({ username, id }));

    const payload = {
      body: inputValue,
      mentions: resolvedMentions,
    };

    const response = await fetch(
      "http://102.36.135.18:3000/n8n/webhook-test/test",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: payload,
          date: new Date().toISOString().split("T")[0],
        }),
      },
    );

    console.log("Sending to server:", payload);
  };

  return (
    <div>
      <Textarea
        ref={textareaRef}
        rows={4}
        value={inputValue}
        onChange={handleChange}
        placeholder="Search users..."
        className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <UserSelect search={search} onSelect={handleSelect} />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default page;
