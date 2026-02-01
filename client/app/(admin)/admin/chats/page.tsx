"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAPI } from "@/lib/adminApi";
import type { AdminChat } from "@/lib/adminTypes";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, Trash2, MessageSquare, Users, User, ArrowRight, Eye } from "lucide-react";

export default function AdminChatsPage() {
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await adminAPI.getChats();
        if (!cancelled) setChats(res);
      } catch {
        if (!cancelled) setError("Failed to load chats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      const name = (c.type === "group" ? c.groupName : `${c.participants?.[0]?.username} ${c.participants?.[1]?.username}`) || "";
      return name.toLowerCase().includes(q) || c._id.toLowerCase().includes(q);
    });
  }, [chats, query]);

  async function removeChat(id: string) {
    if (!confirm("Are you sure? This will permanently delete all messages.")) return;
    try {
      await adminAPI.deleteChat(id);
      setChats((prev) => prev.filter((c) => c._id !== id));
    } catch (e: unknown) {
      setError("Failed to delete chat. Please try again.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Management</h1>
          <p className="text-muted-foreground mt-1">Monitor, moderate, and manage user conversations.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats or IDs..."
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-full text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Table Section */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Chat Identity</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Participants</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => (
              <tr key={c._id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      {c.type === "group" ? (
                        <Users className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      {c.type === "group"
                        ? (c.groupName || "Unnamed Group")
                        : `${c.participants?.[0]?.username || 'User'} & ${c.participants?.[1]?.username || 'User'}`}
                    </span>

                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.type === 'group' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground italic">
                  {c.type === "group" ? `${c.groupMembers?.length ?? 0} members` : "2 users"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/admin/chats/${c._id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-xs font-medium cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeChat(c._id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty/Loading States */}
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Fetching conversations...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <MessageSquare className="w-10 h-10 text-muted/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No conversations matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
