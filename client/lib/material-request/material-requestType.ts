import { InventoryItem } from "../inventoryTypes";

export type StockItem = {
  _id: string;
  product: {
    _id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  location: string;
};

export type RequestLine = {
  inventory: string;
  product: string;
  productName: string;
  unit: string;
  availableQty: number;
  location: string;
  quantity: number;
};

export type MaterialRequest = {
  _id: string;
  requestNumber: string;
  reason: string;
  description?: string;
  items: RequestLine[];
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISPATCHED";
  createdAt: string;
  updatedAt: string;
  requestedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    _id: string;

    name: string;
  };
  fulfilledBy?: {
    _id: string;
    name: string;
  };
};

export type MaterialRequestResponse = {
  data: MaterialRequest[];
  hasNextPage: boolean;
  lastItemId: string;
};

// This type is used for the UI layer to manage the state of request lines, including the available quantity for each inventory item.

export type PopulatedRequestLine = {
  inventory: InventoryItem;
  product: { _id: string; name: string };
  unit: string;
  quantity: number;
};

export type PopulatedMaterialRequest = Omit<MaterialRequest, "items"> & {
  items: PopulatedRequestLine[];
};
