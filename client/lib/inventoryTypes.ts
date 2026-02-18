export type Product = {
  _id: string;
  name: string;
  description?: string;
  category?: "equipment" | "consumable" | "other";
  unit?: string;
  status?: string;
  trackIndividually?: boolean;
};

export type InventoryItem = {
  _id: string;
  product: Product;
  quantity: number;
  location: string;
  lastUpdated: string;
};

export type ProcurementBatch = {
  _id: string;
  product: Product;
  requisition?: { _id: string; requisitionNumber?: string } | null;
  expectedQuantity: number;
  receivedQuantity: number;
  status: "awaiting_receipt" | "partially_received" | "received";
  location?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Asset = {
  _id: string;
  product: Product;
  status: "IN_STOCK" | "ASSIGNED" | "UNDER_MAINTENANCE" | "RETIRED";
  assignedTo?: {
    name?: string;
    email?: string;
    department?: string;
  };
  location?: string;
  serialNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};
