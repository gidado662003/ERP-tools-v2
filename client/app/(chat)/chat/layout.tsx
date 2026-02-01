"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/lib/store";
import SocketInitializer from "@/components/SocketInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/chat/login" || pathname === "/chat/signup";
  const isLandingPage = pathname === "/";
  const notFoundPage = pathname === "/404";
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (!isLoading && !isAuthenticated && !isAuthPage && !isLandingPage && !isAdminRoute) {
      router.push("/chat/login");
    }
  }, [isAuthenticated, isLoading, pathname, router, isAdminRoute]);

  // Show loading while checking auth
  if (isLoading && !["/chat/login", "/chat/signup", "/"].includes(pathname) && !isAdminRoute) {
    return (
      <html lang="en">
        <body>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <>
      {!isAdminRoute && <SocketInitializer />}
      {isAdminRoute ? (
        <div className="h-full">{children}</div>
      ) : isAuthPage ? (
        // Auth pages without sidebar
        <div className="h-full">{children}</div>
      ) : (
        // App pages with permanent sidebar
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">{children}</div>
          </main>
        </div>
      )}
    </>
  );
}
