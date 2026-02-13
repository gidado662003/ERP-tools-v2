import "./globals.css";
import type { Metadata } from "next";
import TokenHandler from "../components/TokenHandler";
import DevAuthInitializer from "../components/DevAuthInitializer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "syscodes Tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE;

  return (
    <html lang="en">
      <body>
        {authMode === "laravel" && <TokenHandler />}
        {authMode === "mock" && <DevAuthInitializer />}

        {children}
        <Toaster />
      </body>
    </html>
  );
}