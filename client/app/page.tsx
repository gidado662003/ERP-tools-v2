"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  FileText,
  User,
  Calendar,
  Moon,
  Sun,
  ShoppingCart,
} from "lucide-react";
import { useModuleStore } from "../lib/moduleStore";
import { useDisplayMode } from "@/lib/store";
import { Button } from "@/components/ui/button";

function HomePage() {
  const toggleMode = useDisplayMode((state) => state.toggleMode);
  const mode = useDisplayMode((state) => state.mode);
  const setModule = useModuleStore((state) => state.setModule);

  const apps = [
    {
      name: "Chat App",
      icon: <MessageSquare className="w-6 h-6" />,
      href: "/chat/chats",
      module: "chat",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      name: "Internal Requisitions",
      icon: <FileText className="w-6 h-6" />,
      href: "/internal-requisitions/",
      module: "request",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      name: "Inventory System",
      icon: <ShoppingCart className="w-6 h-6" />,
      href: "/inventory/",
      module: "inventory",
      gradient: "from-violet-500 to-violet-600",
    },
    {
      name: "Meeting App",
      icon: <Calendar className="w-6 h-6" />,
      href: "/meeting-app/",
      module: "meeting",
      gradient: "from-amber-500 to-amber-600",
    },
    {
      name: "Admin Dashboard",
      icon: <User className="w-6 h-6" />,
      href: "/admin",
      module: "admin",
      gradient: "from-rose-500 to-rose-600",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMode}
          className="rounded-full backdrop-blur bg-white/70 dark:bg-slate-800/70 border"
        >
          {mode === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-4">
              Syscodes Tools
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Choose your workspace to begin
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {apps.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                onClick={() => setModule(app.module)}
                className="group"
              >
                <div
                  className="
                    relative overflow-hidden
                    bg-white dark:bg-slate-900
                    border border-slate-200 dark:border-slate-800
                    rounded-2xl
                    p-8
                    shadow-lg
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:-translate-y-2
                    hover:shadow-2xl
                  "
                >
                  {/* Hover Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <div className="relative flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-br ${app.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      {app.icon}
                    </div>

                    {/* Title */}
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                      {app.name}
                    </span>
                  </div>

                  {/* Shine Animation */}
                  <div
                    className="
                      absolute inset-0
                      bg-gradient-to-r from-transparent via-white/40 to-transparent
                      opacity-0 group-hover:opacity-100
                      transform -translate-x-full group-hover:translate-x-full
                      transition-all duration-700
                    "
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
