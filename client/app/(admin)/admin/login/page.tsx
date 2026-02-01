"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/adminApi";
import { useAdminStore } from "@/lib/adminStore";
import axios from "axios";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminAuthenticated } = useAdminStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminAPI.login({ username, password });
      setAdminAuthenticated(true);
      router.push("/admin");
    } catch (err: unknown) {
      setAdminAuthenticated(false);
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown;
        const maybeError =
          typeof data === "object" && data && "error" in data ? (data as { error?: string }).error : undefined;
        setError(maybeError || "Admin login failed");
      } else {
        setError("Admin login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              A
            </div>
            <h1 className="text-xl font-semibold">Admin sign in</h1>
            <p className="text-sm text-muted-foreground">
              Use your admin credentials to manage the app.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</div>}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-center text-xs text-muted-foreground">
              This area is separate from normal user login.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

