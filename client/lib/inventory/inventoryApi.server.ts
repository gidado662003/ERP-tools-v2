import { cookies } from "next/headers";
import type {
  Asset,
  AssetHistory,
  InventoryItem,
  InventoryMovement,
  ProcurementBatch,
  AssetGroup,
} from "@/lib/inventoryTypes";

import { Supplier } from "@/components/internal-requsitions/suppliers/supplierList";

// Direct to backend — bypasses Apache/public IP entirely
const SERVER_API_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:5001/api";

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
    throw new Error(`[inventoryApi.server] ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const inventoryServerAPI = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const data = await serverFetch<{ data: InventoryItem[] }>("/inventory");
    return data.data;
  },

  getAssets: async (): Promise<Asset[]> => {
    return serverFetch<Asset[]>("/asset");
  },

  getAssetsByID: async (assetId: string): Promise<Asset> => {
    return serverFetch<Asset>(`/asset/${assetId}`);
  },

  getAssetsSummary: async (payload: {
    location?: string;
    search?: string;
  }): Promise<AssetGroup[]> => {
    const params = new URLSearchParams();
    if (payload.location) params.append("location", payload.location);
    if (payload.search) params.append("search", payload.search);
    return serverFetch<AssetGroup[]>(`/asset/summary?${params.toString()}`);
  },

  getAssetsByProduct: async (
    productId: string,
    search?: string,
  ): Promise<Asset[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    return serverFetch<Asset[]>(
      `/asset/product/${productId}?${params.toString()}`,
    );
  },

  getBatches: async (): Promise<ProcurementBatch[]> => {
    return serverFetch<ProcurementBatch[]>("/procurement-batches");
  },

  getBatchById: async (batchId: string): Promise<ProcurementBatch> => {
    return serverFetch<ProcurementBatch>(`/procurement-batches/${batchId}`);
  },

  getInventoryMovements: async (
    productId?: string,
  ): Promise<InventoryMovement[]> => {
    const params = new URLSearchParams();
    if (productId) params.append("productId", productId);
    return serverFetch<InventoryMovement[]>(
      `/inventory-movements?${params.toString()}`,
    );
  },

  getAssetHistory: async (assetId: string): Promise<AssetHistory[]> => {
    return serverFetch<AssetHistory[]>(`/asset/movements/history/${assetId}`);
  },

  getAssetMovementsData: async (assetId: string, userSearch?: string) => {
    const params = new URLSearchParams();
    if (userSearch) params.append("userSearch", userSearch);
    return serverFetch(`/asset/movements/${assetId}?${params.toString()}`);
  },

  getSuppliers: async (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    return serverFetch<Supplier[]>(`/suppliers?${params.toString()}`);
  },
};
