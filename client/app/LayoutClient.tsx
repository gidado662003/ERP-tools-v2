"use client";

import TokenHandler from "../components/TokenHandler";
import DevAuthInitializer from "../components/DevAuthInitializer";

export default function LayoutClient({
  children,
  authMode,
}: {
  children: React.ReactNode;
  authMode?: string;
}) {
  return (
    <>
      {authMode === "laravel" && <TokenHandler />}
      {authMode === "mock" && <DevAuthInitializer />}
      {children}
    </>
  );
}
