// lib/material-request/material-requestApi.server.ts

import { cookies } from "next/headers";
import {
  MaterialRequest,
  MaterialRequestResponse,
} from "./material-requestType";

const SERVER_API_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:5001/api";

async function serverFetch(path: string, options?: RequestInit) {
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
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

export const materialRequestServerAPI = {
  getMaterialRequestById: async (id: string) => {
    return serverFetch(`/material-requests/${id}`);
  },

  getMaterialRequests: async ({
    status,
    search,
    cursor,
  }: {
    status?: string;
    search?: string;
    cursor?: string;
  }) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (cursor) params.set("cursor", cursor);

    const data = await serverFetch(`/material-requests?${params}`);
    return data;
  },
};
