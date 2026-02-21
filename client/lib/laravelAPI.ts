import axios from "axios";

export const laravelAPI = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const laravelAuthAPI = {
  getCustomers: async (search?: string): Promise<any[]> => {
    const res = await laravelAPI.get<{ data: any[] }>("/inventory/customers", {
      params: { search },
    });
    return res.data.data;
  },
  getEmployees: async (search?: string): Promise<any[]> => {
    const res = await laravelAPI.get("/users", {
      params: { search },
    });
    return res.data;
  },
};
