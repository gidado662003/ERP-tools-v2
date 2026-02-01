"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminAPI } from "@/lib/adminApi";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, isAdminLoading, setAdminAuthenticated, setAdminLoading } =
    useAdminStore();

  const isAdminLogin = pathname === "/admin/login";

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (isAdminLogin) return;
      setAdminLoading(true);
      try {
        await adminAPI.checkAuth();
        if (!cancelled) setAdminAuthenticated(true);
      } catch {
        if (!cancelled) setAdminAuthenticated(false);
        router.push("/admin/login");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, isAdminLogin, setAdminAuthenticated, setAdminLoading]);

  if (isAdminLogin) return <>{children}</>;

  if (isAdminLoading && !isAdminAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Checking admin session…</div>
      </div>
    );
  }

  return <>{children}</>;
}

