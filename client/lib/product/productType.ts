export type Product = {
  _id: string;
  source: "requisition"; // you can expand this later if needed
  note: string;
  name: string;
  unit: string;
  status: "draft" | "active" | "archived"; // adjust based on your enum
  trackIndividually: boolean;
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date
  __v: number;
};
