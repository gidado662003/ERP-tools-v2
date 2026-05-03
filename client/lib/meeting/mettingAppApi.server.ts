import { cookies } from "next/headers";
import { Meeting, ActionItem } from "@/lib/meeting/meetingAppTypes";

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

function buildParams(obj: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

export const meetingServerAPI = {
  getMeetings: async (search?: string, cursorTimestamp?: string) => {
    return serverFetch(`/meeting/list${buildParams({ search, cursorTimestamp })}`);
  },

  getMeetingsById: async (id: string | string[]) => {
    return serverFetch(`/meeting/list/${id}`);
  },

  getDashboardData: async (startDate?: string, endDate?: string) => {
    return serverFetch(`/meeting/dashboard${buildParams({ startDate, endDate })}`);
  },

  getActionItems: async (status?: string) => {
    return serverFetch(`/meeting/actionitem/list${buildParams({ status })}`);
  },

  createMeeting: async (meetingData: Meeting, actionItemsData: ActionItem[]) => {
    return serverFetch(`/meeting/create`, {
      method: "POST",
      body: JSON.stringify({ meetingData, actionItemsData }),
    });
  },

  markActionItemComplete: async (id: string) => {
    return serverFetch(`/meeting/actionitem/list/${id}`, {
      method: "PATCH",
    });
  },
};