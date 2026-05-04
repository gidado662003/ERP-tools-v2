"use client";

import { useEffect, useState } from "react";
import TokenHandler from "../components/TokenHandler";
import { useAuthStore } from "../lib/store";
import { isAuthenticated } from "../app/api";

export default function LayoutClient({
  children,
  authMode,
}: {
  children: React.ReactNode;
  authMode?: string;
}) {
  const [loading, setLoading] = useState(authMode === "laravel");
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          const res = await isAuthenticated(); // calls /api/me
          if (res.user) {
            setUser(res.user);
            return;
          }
        }

        // ❌ Not authenticated → redirect
        if (!user) {
          window.location.href = process.env.NEXT_PUBLIC_LARAVEL as string;
        }
      } catch (err) {
        window.location.href = process.env.NEXT_PUBLIC_LARAVEL as string;
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [loading, user, setUser]);

  return (
    <>
      {authMode === "laravel" && (
        <TokenHandler onDone={() => setLoading(false)} />
      )}

      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        children
      )}
    </>
  );
}
