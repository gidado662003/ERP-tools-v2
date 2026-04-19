import axios from "axios";
const inventorsupplierApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
interface Supplier {
  _id: string;
  name: string;
  slug: string;
  contactInfo: { email: string; phone: string; address: string };
  itemsSupplied: number;
}
export const supplierAPI = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await inventorsupplierApi.get<{ data: Supplier[] }>(
      "/suppliers",
    );
    return res.data.data;
  },
  addSupplier: async (payload: {
    name: string;
    contactInfo: { email: string; phone: string; address: string };
  }) => {
    const res = await inventorsupplierApi.post("/suppliers", payload);
    return res.data;
  },
  productsBySupplier: async (supplierId: string) => {
    const res = await inventorsupplierApi.get(
      `/suppliers/${supplierId}/products`,
    );
    return res.data;
  },
};
