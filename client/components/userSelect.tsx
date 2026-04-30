"use client";
import React, { useEffect, useState } from "react";
import { getAllusers } from "@/app/api";

export type User = {
  _id: string;
  username: string;
};

function UserSelect({
  search,
  onSelect,
}: {
  search: string;
  onSelect: (username: string, userId: string) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const allUsers = await getAllusers(search);
      setUsers(allUsers.data.users);
      setLoading(false);
    };

    fetchUsers();
  }, [search]);
  if (!search) {
    return null;
  }
  return (
    <div>
      <div className="">
        <div>
          {users.map((user) => (
            <div
              onClick={() => onSelect(user.username, user._id)}
              key={user._id}
            >
              {user.username}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserSelect;
