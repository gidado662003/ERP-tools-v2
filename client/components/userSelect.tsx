"use client";
import React, { useEffect, useState } from "react";
import { getAllusers } from "@/app/api";
import { Textarea } from "@/components/ui/textarea";
function UserSelect({ search }: { search: string }) {
  const [users, setUsers] = useState([]);
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

  return (
    <div>
      <div className="">
        <div>
          {users.map((user) => (
            <div key={user.id}>{user.username}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserSelect;
