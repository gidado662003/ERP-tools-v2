"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/adminApi";
import type { AdminChat, AdminMessage } from "@/lib/adminTypes";
import axios from "axios";
import { Trash2, MessageSquareText, Eye, Undo2 } from "lucide-react";



export default function AdminChatDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const chatId = params?.id;

  const [chat, setChat] = useState<AdminChat | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!chatId) return;
      setLoading(true);
      setError(null);
      try {
        const [c, m] = await Promise.all([
          adminAPI.getChat(chatId),
          adminAPI.getChatMessages(chatId),
        ]);
        if (!cancelled) {
          setChat(c);
          setMessages(m);
        }
      } catch {
        if (!cancelled) setError("Failed to load chat");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const title = useMemo(() => {
    if (!chat) return "Chat";
    return chat.type === "group" ? chat.groupName || "Group chat" : "Private chat";
  }, [chat]);

  async function handleSoftDeleteMessage(messageId: string) {
    const ok = confirm("Soft-delete this message? It can be restored later.");
    if (!ok) return;
    setError(null);
    try {
      await adminAPI.deleteMessage(chatId, messageId); // This now calls soft-delete
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as unknown;
        const maybeError =
          typeof data === "object" && data && "error" in data ? (data as { error?: string }).error : undefined;
        setError(maybeError || "Failed to soft-delete message");
      } else {
        setError("Failed to soft-delete message");
      }
    }
  }

  async function handleUndeleteMessage(messageId: string) {
    const ok = confirm("Undelete this message?");
    if (!ok) return;
    setError(null);
    try {
      await adminAPI.undeleteMessage(chatId, messageId); // Use service function to undelete
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: false } : m))
      );
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as unknown;
        const maybeError =
          typeof data === "object" && data && "error" in data ? (data as { error?: string }).error : undefined;
        setError(maybeError || "Failed to undelete message");
      } else {
        setError("Failed to undelete message");
      }
    }
  }

  async function handlePermanentDeleteMessage(messageId: string) {
    const ok = confirm("PERMANENTLY delete this message? This cannot be undone.");
    if (!ok) return;
    setError(null);
    try {
      await adminAPI.deleteMessagePermanent(chatId, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId)); // Remove from UI
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as unknown;
        const maybeError =
          typeof data === "object" && data && "error" in data ? (data as { error?: string }).error : undefined;
        setError(maybeError || "Failed to permanently delete message");
      } else {
        setError("Failed to permanently delete message");
      }
    }
  }

  async function deleteChat() {
    const ok = confirm("Delete this chat AND all its messages?");
    if (!ok) return;
    setError(null);
    try {
      await adminAPI.deleteChat(chatId);
      router.push("/admin/chats");
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as unknown;
        const maybeError =
          typeof data === "object" && data && "error" in data ? (data as { error?: string }).error : undefined;
        setError(maybeError || "Failed to delete chat");
      } else {
        setError("Failed to delete chat");
      }
    }
  }

  return (
    <div className="space-y-6 h-screen overflow-scrool">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">
            <Link href="/admin/chats" className="hover:underline">
              Chats
            </Link>{" "}
            / <span className="font-mono">{chatId}</span>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Inspect messages and moderate content.
          </p>
        </div>

        <button onClick={deleteChat} className="rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          Delete chat
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="rounded-xl border bg-card p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Meta label="Type" value={chat?.type} />
              <Meta label="Participants" value={(chat?.participants?.length ?? 0).toString()} />
              <Meta label="Updated" value={chat?.updatedAt ? new Date(chat.updatedAt).toLocaleString() : "-"} />
              <Meta label="Memebers" value={chat?.type === "private" ?
                (chat?.participants?.map(items => items.username))
                : chat?.groupMembers?.map(items => items.username)} />
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b px-4 py-3 text-sm font-medium">Messages ({messages.length})</div>
            <div className="max-h-[65vh] overflow-auto">
              {messages.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No messages.</div>
              ) : (
                <ul className="divide-y">
                  {messages.map((m) => (
                    <li key={m._id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className={[`font-medium`, m.isDeleted ? `text-muted-foreground line-through` : `text-foreground`].join(" ")}>
                              {m.senderId?.username || "Unknown"}
                            </span>
                            {m.isDeleted && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-destructive">Deleted</span>}

                            <span>{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</span>
                          </div>
                          <div className={`mt-2 whitespace-pre-wrap text-sm ${m.isDeleted ? `text-muted-foreground italic` : ``}`}>
                            {m.text}
                          </div>
                          {m.type !== "text" && (
                            <div className={`mt-2 text-xs text-muted-foreground ${m.isDeleted ? `line-through` : ``}`}>
                              type: {m.type} {m.fileUrl ? `· file: ${m.fileUrl}` : ""}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {m.isDeleted ? (
                            <button
                              onClick={() => handleUndeleteMessage(m._id)}
                              className="shrink-0 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                            >
                              <Undo2 size={12} /> Undelete
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSoftDeleteMessage(m._id)}
                              className="shrink-0 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                            >
                              <Trash2 size={12} /> Soft Delete
                            </button>
                          )}
                          <button
                            onClick={() => handlePermanentDeleteMessage(m._id)}
                            className="shrink-0 rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 size={12} /> Permanent Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value?: string[] | string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>

      {Array.isArray(value) ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.length === 0 ? (
            <span className="text-sm text-muted-foreground">-</span>
          ) : (
            value.map((v) => (
              <span
                key={v}
                className="rounded-full border bg-accent/40 px-4 py-0.5 text-xs font-medium"
              >
                {v}
              </span>
            ))
          )}
        </div>
      ) : (
        <div className="mt-1 text-sm font-medium">{value || "-"}</div>
      )}
    </div>
  );
}
