import { cookies } from "next/headers";

const SERVER_API_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:5001/api";

interface Supplier {
  _id: string;
  name: string;
  slug: string;
  contactInfo: { email: string; phone: string; address: string };
  itemsSupplied: number;
}

async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
    throw new Error(`[supplierApi.server] ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const supplierServerAPI = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const data = await serverFetch<{ data: Supplier[] }>("/suppliers");
    return data.data;
  },

  productsBySupplier: async (supplierId: string) => {
    return serverFetch<any[]>(`/suppliers/${supplierId}/products`);
  },
};
