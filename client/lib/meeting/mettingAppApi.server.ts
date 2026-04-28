import { cookies } from "next/headers";
import { Meeting, ActionItem } from "@/lib/meeting/meetingAppTypes";
import { MeetingPreview } from "@/lib/meeting/meetingAppTypes";

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
    throw new Error(`[meetingApi.server] ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const meetingServerAPI = {
  getMeetings: async (search: string, cursorTimestamp: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (cursorTimestamp) params.set("cursorTimestamp", cursorTimestamp);
    return serverFetch(`/meeting/list?${params.toString()}`);
  },

  getMeetingsById: async (id: string | string[]) => {
    return serverFetch(`/meeting/list/${id}`);
  },
};
