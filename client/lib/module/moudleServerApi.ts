import { cookies } from "next/headers";
import { Module, ModuleListResponse, ModuleResponse } from "./moduleType";

const SERVER_API_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:5001/api";

async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();

  const res = await fetch(`${SERVER_API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[moduleServerApi] ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const moduleServerAPI = {
  getModules: async (): Promise<ModuleListResponse> => {
    return serverFetch("/modules");
  },
  getModulesAdmin: async (): Promise<ModuleListResponse> => {
    return serverFetch("/admin/modules");
  },
};
