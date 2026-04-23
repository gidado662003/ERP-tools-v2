import axios from "axios";
import {
  MaterialRequest,
  MaterialRequestResponse,
} from "./material-requestType";
import { RequestLine } from "./material-requestType";
export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const materialRequestAPI = {
  getMaterialRequests: async ({
    status,
    search,
    cursor,
  }: {
    status?: string;
    search?: string;
    cursor?: string;
  }) => {
    const res = await adminApi.get("/material-requests", {
      params: {
        status: status ?? undefined,
        search: search ?? undefined,
        cursor: cursor ?? undefined,
      },
    });
    return res.data as MaterialRequestResponse;
  },
  createMaterialRequest: async (payload: {
    reason: string;
    items: { inventory: string; product: string; quantity: number }[];
  }) => {
    const res = await adminApi.post("/material-requests/create", payload);
    return res.data;
  },
  getMaterialRequestById: async (id: string) => {
    const res = await adminApi.get(`/material-requests/${id}`);
    return res.data;
  },
  approveRequestStatus: async (id: string) => {
    const res = await adminApi.patch(`/material-requests/${id}/approve`);
    return res.data as MaterialRequest;
  },
  rejectRequestStatus: async (id: string, comment: string) => {
    const res = await adminApi.patch(`/material-requests/${id}/reject`, {
      comment,
    });
    return res.data as MaterialRequest;
  },
  dispatchRequestStatus: async (id: string) => {
    const res = await adminApi.patch(`/material-requests/${id}/dispatch`);
    return res.data as MaterialRequest;
  },
};
