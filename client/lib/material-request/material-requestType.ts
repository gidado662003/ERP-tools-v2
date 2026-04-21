export interface MaterialRequest {}

export type StockItem = {
  _id: string;
  product: { _id: string; name: string; unit: string };
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
