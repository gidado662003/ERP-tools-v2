"use client";
import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useSocketStore } from "../store/useSocketStore";
import { useAuthStore } from "../lib/store";

export default function SocketInitializer() {
  const setIsConnected = useSocketStore((state) => state.setIsConnected);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {

    if (isAuthenticated && user?._id) {

      socket.auth = { userId: user._id };

      socket.connect();

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      };
    } else {
      socket.disconnect();
    }
  }, [setIsConnected, isAuthenticated, user]);

  return null;
}