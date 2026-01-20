// src/stores/useSocketStore.ts
import { create } from "zustand";

type SocketStore = {
  isConnected: boolean;
  setIsConnected: (val: boolean) => void;
};

export const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  setIsConnected: (val) => set({ isConnected: val }),
}));
