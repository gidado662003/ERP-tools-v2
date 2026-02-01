import axios from "axios";
import { InternalRequisition } from "@/lib/internalRequestTypes";

export const requestApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const internlRequestAPI = {
  countList: async () => {
    try {
      const res = requestApi.get("/internalrequest/list");
      return res;
    } catch (error) {
      console.error("Count List failed", error);
    }
  },
  allData: async ({
    search,
    status,
    bank,
    cursorTimestamp,
    cursorId,
  }: {
    search?: string;
    status?: string;
    bank?: string;
    cursorTimestamp?: string;
    cursorId?: string;
  }) => {
    try {
      const res = await requestApi.get<InternalRequisition[]>(
        `/internalrequest/allrequest`,
        { params: { search, status, bank, cursorTimestamp, cursorId } },
      );
      return res.data;
    } catch (error) {
      console.error("Fetch all data failed", error);
    }
  },
  dataById: async (id: string) => {
    try {
      const res = await requestApi.get(`/internalrequest/allrequest/${id}`);
      return res.data;
    } catch (error) {
      console.error("Fetch all data failed", error);
    }
  },
};
// /internalrequest/allrequest
