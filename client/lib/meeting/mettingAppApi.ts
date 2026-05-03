import axios from "axios";
import { Meeting, ActionItem } from "@/lib/meeting/meetingAppTypes";
const mettingAppApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const mettingAppAPI = {
  getMeetings: async (search: string, cursorTimestamp: string) => {
    const response = await mettingAppApi.get("/meeting/list", {
      params: { search, cursorTimestamp },
    });
    return response.data;
  },
  getMeetingsById: async (id: string | string[]) => {
    const response = await mettingAppApi.get(`/meeting/list/${id}`);
    return response.data;
  },
  createMeeting: async ({
    meetingData,
    actionItemsData,
  }: {
    meetingData: Meeting;
    actionItemsData: ActionItem[];
  }) => {
    const response = await mettingAppApi.post(`/meeting/create`, {
      meetingData,
      actionItemsData,
    });
    return response.data;
  },
  getDashboardData: async ({
    dateQuery,
  }: {
    dateQuery: { startDate: string; endDate: string };
  }) => {
    const response = await mettingAppApi.get(`/meeting/dashboard`, {
      params: { dateQuery },
    });
    return response.data;
  },
  getActionItems: async ({ status }: { status: string }) => {
    const response = await mettingAppApi.get("/meeting/actionitem/list", {
      params: {
        status,
      },
    });
    return response.data;
  },
  markActionItemComplete: async (id: string) => {
    const response = await mettingAppApi.patch(
      `/meeting/actionitem/list/${id}`,
    );
    return response;
  },
};
