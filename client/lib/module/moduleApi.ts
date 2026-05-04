import axios from "axios";
import { Module, ModuleResponse } from "./moduleType";
const Api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const moduleAppAPI = {
  getModules: async () => {
    const response = await Api.get("/modules");
    return response.data;
  },
  createModule: async (data: Module) => {
    const response = await Api.post<ModuleResponse>("/modules", data);
    return response.data.data;
  },
  updateModule: async (id: string, data: Module) => {
    const response = await Api.put<ModuleResponse>(`/modules/${id}`, data);
    return response.data.data;
  },
  deleteModule: async (id: string) => {
    const response = await Api.delete<ModuleResponse>(`/modules/${id}`);
    return response.data.data;
  },
  getModuleById: async (id: string) => {
    const response = await Api.get<ModuleResponse>(`/modules/${id}`);
    return response.data.data;
  },
};
