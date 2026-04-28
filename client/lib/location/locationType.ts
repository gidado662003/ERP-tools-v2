export type LocationType =
  | "STORE"
  | "CUSTOMER_SITE"
  | "NOC"
  | "POP"
  | "VENDOR_SITE";

export type LocationCategory = "cpe" | "noc" | "pop" | "other";

export type Location = {
  _id: string;
  name: string;
  type: LocationType;
  defaultCategory: LocationCategory;
  address?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
