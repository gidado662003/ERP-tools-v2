import axios from "axios";
import { Location, LocationCategory, LocationType } from "./locationType";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const locationApi = {
  getLocations: async ({ search }: { search: string }) => {
    const response = await api.get<Location[]>("/locations", {
      params: { search },
    });
    return response.data;
  },
  getLocationByName: async (name: string) => {
    const response = await api.get<Location | null>("/locations/name", {
      params: { name },
    });
    return response.data;
  },
  createLocation: async (payload: {
    name: string;
    type: LocationType;
    defaultCategory: LocationCategory;
    address?: string;
    isActive?: boolean;
  }) => {
    const response = await api.post<{
      message: string;
      location: Location;
    }>("/locations", payload);
    return response.data;
  },
};
