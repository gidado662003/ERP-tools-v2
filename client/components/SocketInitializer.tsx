"use client";
import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useSocketStore } from "../store/useSocketStore";

export default function SocketInitializer() {
  const setIsConnected = useSocketStore((state) => state.setIsConnected);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [setIsConnected]);

  return null;
}
