import axios from "axios";
import { UploadFilePayload } from "./documentsTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const documentsApi = {
  getDepartments: async () => {
    try {
      const response = await api.get("/departments");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCategories: async ({ q, sort }: { q: string; sort: string }) => {
    try {
      const response = await api.get(`/document-categories`, {
        params: {
          q,
          sort,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDeletedCategories: async ({ q, sort }: { q: string; sort: string }) => {
    try {
      const response = await api.get(`/document-categories/delete`, {
        params: {
          q,
          sort,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCategory: async (name: string, parentCategoryId?: string) => {
    try {
      const response = await api.post("/document-categories", {
        name,
        parentCategoryId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  renameCategory: async (name: string, id: string) => {
    try {
      const response = await api.put(`/document-categories/rename/${id}`, {
        name,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteCategory: async (id: string) => {
    try {
      const response = await api.put(`/document-categories/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  recoverCategory: async (id: string) => {
    try {
      const response = await api.put(`/document-categories/recover/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadFile: async (formData: FormData) => {
    try {
      const response = await api.post("/document/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getFilesByCategory: async (
    category: string | string[],
    { q, sort }: { q: string; sort?: string },
  ) => {
    try {
      const response = await api.get(`/document/files/${category}`, {
        params: {
          q,
          sort,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
