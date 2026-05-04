"use client";
import { useEffect } from "react";
import { authAPI } from "../app/api";
import { useAuthStore } from "../lib/store";

export default function TokenHandler({ onDone }: { onDone: () => void }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          onDone(); // nothing to do
          return;
        }

        const serverOrigin = window.location.origin;

        // Step 1: Exchange token
        await fetch(`${serverOrigin}/api/auth/token`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        sessionStorage.setItem("erp_token", token);

        // Step 2: Sync user
        const syncResponse = await authAPI.syncUserProfile();

        if (syncResponse.user) {
          setUser(syncResponse.user);
        }

        // Step 3: Clean URL
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, "", newUrl);
      } catch (err) {
        console.error("[TokenHandler] Sync error:", err);
      } finally {
        onDone(); // always finish
      }
    };

    run();
  }, [setUser, onDone]);

  return null;
}
