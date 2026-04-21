export type StockItem = {
  _id: string;
  product: { _id: string; name: string; unit: string };
  quantity: number;
  location: string;
};

export type RequestLine = {
  inventory: {
    _id: string;
    name: string;
    unit: string;
    location?: string;
    quantity?: number;
  };
  product: { _id: string; name: string };
  productName?: string;
  unit: string;
  availableQty?: number;
  location?: string;
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
