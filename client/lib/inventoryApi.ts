import axios from "axios";
import type { Asset, InventoryItem, ProcurementBatch } from "@/lib/inventoryTypes";

const inventoryApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const inventoryAPI = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const res = await inventoryApi.get<{ data: InventoryItem[] }>("/inventory");
    return res.data.data;
  },

  getAssets: async (): Promise<Asset[]> => {
    const res = await inventoryApi.get<Asset[]>("/asset");
    return res.data;
  },

  getBatches: async (): Promise<ProcurementBatch[]> => {
    const res = await inventoryApi.get<ProcurementBatch[]>(
      "/procurement-batches"
    );
    return res.data;
  },

  receiveBatch: async (
    batchId: string,
    payload: { quantity: number; serialNumbers?: string[] }
  ): Promise<ProcurementBatch> => {
    const res = await inventoryApi.post<ProcurementBatch>(
      `/procurement-batches/${batchId}`,
      payload
    );
    return res.data;
  },
};
