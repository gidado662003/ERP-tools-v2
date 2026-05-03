"use client";

import { useState, useEffect } from "react";
import { Circle } from "lucide-react";
import { getUserBYId } from "@/app/api";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  role: string;
  department: string;
}

function UserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      try {
        const data = await getUserBYId(userId);
        setUser(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (!user) return null;
  if (loading) {
    return <div>loading</div>;
  }

  return (
    <div>
      {/* Avatar */}
      <img
        src={user.avatar}
        alt={user.displayName}
        className="h-8 w-8 rounded-full border border-[#e0dfe3] dark:border-[#2a2535]"
      />

      {/* Info */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-[#1d1c21] dark:text-[#e4e0f0]">
            {user.displayName}
          </p>

          {/* Online indicator */}
          <Circle
            className={`h-2 w-2 ${
              user.isOnline
                ? "fill-green-500 text-green-500"
                : "fill-gray-400 text-gray-400"
            }`}
          />
        </div>

        <p className="text-[11px] text-[#80748d]">@{user.username}</p>

        <p className="text-[10px] text-[#a89cc0] capitalize">
          {user.department}
        </p>
      </div>
    </div>
  );
}

export default UserCard;
