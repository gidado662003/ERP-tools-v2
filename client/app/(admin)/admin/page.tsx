"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAPI } from "@/lib/adminApi";
import type { AdminChat, AdminUser } from "@/lib/adminTypes";

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<AdminUser[] | null>(null);
    const [chats, setChats] = useState<AdminChat[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const [us, ch] = await Promise.all([adminAPI.getUsers(), adminAPI.getChats()]);
                if (!cancelled) {
                    setUsers(us);
                    setChats(ch);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setError("Failed to load admin data");
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const stats = useMemo(() => {
        const totalUsers = users?.length ?? 0;
        const totalChats = chats?.length ?? 0;
        const groupChats = chats?.filter((c) => c?.type === "group")?.length ?? 0;
        const privateChats = totalChats - groupChats;
        return { totalUsers, totalChats, groupChats, privateChats };
    }, [users, chats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Loading…</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Overview of the platform.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Users" value={stats.totalUsers} />
                <StatCard title="Chats" value={stats.totalChats} />
                <StatCard title="Group chats" value={stats.groupChats} />
                <StatCard title="Private chats" value={stats.privateChats} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                    <div className="mb-2 text-sm font-medium">Recent users</div>
                    <div className="space-y-2">
                        {(users ?? []).slice(0, 6).map((u) => (
                            <div key={u._id} className="flex items-center justify-between text-sm">
                                <div className="min-w-0">
                                    <div className="truncate font-medium">{u.username}</div>
                                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                                </div>
                                <div className="text-xs text-muted-foreground">{u.role ?? "user"}</div>
                            </div>
                        ))}
                        {!users && <div className="text-sm text-muted-foreground">Loading…</div>}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <div className="mb-2 text-sm font-medium">Recent chats</div>
                    <div className="space-y-2">
                        {(chats ?? []).slice(0, 6).map((c) => (
                            <div key={c._id} className="flex items-center justify-between text-sm">
                                <div className="min-w-0">
                                    <div className="truncate font-medium">
                                        {c.type === "group" ? c.groupName || "Group chat" : "Private chat"}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        {c.participants?.length ?? 0} participants
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">{c.type}</div>
                            </div>
                        ))}
                        {!chats && <div className="text-sm text-muted-foreground">Loading…</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
        </div>
    );
}

