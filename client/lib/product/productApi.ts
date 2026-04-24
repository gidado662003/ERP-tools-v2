import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const productApi = {
  getProducts: async ({ search }: { search: string }) => {
    try {
      const response = await api.get("/products", {
        params: { search },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getProductByName: async (name: string) => {
    console.log("🚀 ~ name:", name);
    try {
      const response = await api.get("/products/name", {
        params: { name: name },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
