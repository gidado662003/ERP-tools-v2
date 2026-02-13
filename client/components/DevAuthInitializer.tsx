"use client";
import { useEffect } from "react";
import { useAuthStore } from "../lib/store";

const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE;

export default function DevAuthInitializer() {
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (AUTH_MODE !== "mock") return;
    if (isAuthenticated) return;

    // 👇 This must match what backend mock user returns
    setUser({
      _id: "698ee293492c9e5f2de4108c",
       username: "dev.user",
          email: "dev@test.com",
          role: "admin",
          department: "Development",
    });

    console.log("Mock user injected");
  }, [setUser, isAuthenticated]);

  return null;
}