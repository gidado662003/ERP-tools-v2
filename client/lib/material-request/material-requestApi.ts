import axios from "axios";
import { MaterialRequest } from "./material-requestType";
export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const materialRequestAPI = {
  getMaterialRequests: async () => {
    const res = await adminApi.get("/material-requests");
    return res.data as MaterialRequest[];
  },
  createMaterialRequest: async (payload: {
    title: string;
    description: string;
    items: { name: string; quantity: number }[];
  }) => {
    const res = await adminApi.post("/material-requests/create", payload);
    return res.data as MaterialRequest;
  },
};
