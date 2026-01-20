"use client";

import { MessageCircle, Users, Settings, LogOut, Hash } from "lucide-react";
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CreateGroupChatModal } from "@/components/settingModals";
import { Button } from "@/components/ui/button";
import { createOrGetPrivateChat, getAllusers, getUserChats } from "@/app/api";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket"
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface User {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
}

interface UsersResponse {
  users: User[];
}

interface Chat {
  _id: string;
  type: "private" | "group";
  participants: User[];
  groupName?: string;
  groupDescription?: string;
  privateLastChat?: { text: string; senderId: string; readBy: string[]; timestamp: string };
  groupLastMessage?: { text: string; senderId: string; timestamp: string; readBy?: string[] };
  groupMembers?: User[];
  updatedAt: string;
}

export function AppSidebar() {
  const { user } = useAuthStore();

  const router = useRouter();

  const [usersData, setUsersData] = useState<UsersResponse>();
  const [chats, setChats] = useState<Chat[]>([]);

  const [loading, setLoading] = useState(true);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [Search, setSearch] = useState<string>("")

  useEffect(() => {
    if (!hasFetched) {
      fetchUsers();
      fetchUserChats();
      setHasFetched(true);
    }

  }, [hasFetched]);

  useEffect(() => {
    fetchUserChats();

  }, [Search])

  useEffect(() => {
    const handleReceiveMessage = () => {
      fetchUserChats();
    };
    socket.on("chat_list_update",
      handleReceiveMessage
    )
    return () => {
      socket.off("chat_list_update", handleReceiveMessage);
    };
  }, [])

  useEffect(() => {
    const handleMessagesRead = (data: any) => {

      fetchUserChats();
    };
    socket.on("messages_read", handleMessagesRead);
    return () => {
      socket.off("messages_read", handleMessagesRead);
    };
  }, []);

  async function fetchUsers() {
    try {
      const res = await getAllusers();
      setUsersData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserChats() {
    try {
      const res = await getUserChats(Search);

      setChats(res.chats);
    } catch (err) {
      console.error(err);
    } finally {
      setChatsLoading(false);
    }
  }

  async function handleChat(userId: string) {
    try {
      const res = await createOrGetPrivateChat(userId);
      router.push(`/chats/${res.chat._id}`);
    } catch (err) {
      console.error(err);
    }
  }

  const settings = [
    {
      label: "My Profile",
      icon: <Hash className="h-4 w-4" />,
      href: "/profile",
    },
    {
      label: "New Group Chat",
      icon: <Users className="h-4 w-4" />,
      button: <CreateGroupChatModal />,
      onClick: () => {
        // console.log("Create Group Chat");
      },
    },
  ];

  function isPrivateRead(chat: Chat) {
    if (!chat.privateLastChat || !user) return false;

    const lastMessage = chat.privateLastChat;

    const senderId = lastMessage.senderId;

    // If the OTHER user sent the message,
    // then from YOUR perspective, it's already read
    if (senderId !== user._id) {
      return true;
    }

    // You sent the message → check if other user has read it
    const otherUser = chat.participants.find(
      (p) => p._id !== user._id
    );

    if (!otherUser) return false;
    const result = lastMessage.readBy?.some(
      (id) => id.toString() === otherUser._id.toString()
    );

    return result;
  }



  function isGroupFullyRead(chat: Chat) {
    if (!chat.groupLastMessage || !chat.groupMembers) return false;

    const senderId = chat.groupLastMessage.senderId;

    const otherMembers = chat.groupMembers.filter(
      (m) => m._id !== senderId
    );

    const readCount =
      chat.groupLastMessage.readBy?.filter((id) =>
        otherMembers.some((m) => m._id === id)
      ).length || 0;

    return readCount === otherMembers.length;
  }


  return (
    <aside className="w-72 h-screen bg-white border-r flex flex-col">
      {/* User Header */}
      <div className="p-5 border-b">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Navigation */}
        <div>
          <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase">
            Navigation
          </p>
          <Link
            href="/chats"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            <MessageCircle className="h-4 w-4 text-blue-500" />
            Global Chat
          </Link>
        </div>
        {/* Search Input */}
        <div>
          <input type="text" name="" value={Search} onChange={(e) => { setSearch(e.target.value) }} id="" className="w-full p-[5px] indent-3 border-2 rounded-2xl" />
        </div>

        {/* Recent Chats */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Recent Chats
            </p>
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
            >
              {showUsers ? "Hide" : "Show"} Users
            </button>
          </div>



          {chatsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length > 0 ? (
            <div className="space-y-1">
              {chats.map((chat) => {


                return (
                  <Link
                    key={chat._id}
                    href={`/chats/${chat._id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                      {chat.type === "group"
                        ? chat.groupName?.charAt(0).toUpperCase() || "G"
                        : chat.participants
                          .find((p) => p._id !== user?._id)
                          ?.username?.charAt(0)
                          .toUpperCase() || "U"}
                    </div>
                    <div className="flex justify-between items-center w-full">

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate uppercase">
                          {chat.type === "group"
                            ? chat.groupName || "Group Chat"
                            : chat.participants.find((p) => p._id !== user?._id)
                              ?.username || "Unknown User"}
                        </p>
                        <p className={`text-xs font-bold text-gray-500 truncate `}>
                          {chat.type === "group"
                            ? chat.groupLastMessage?.text || "No messages yet"
                            : chat.privateLastChat?.text || "No messages yet"}
                        </p>

                      </div>
                      <div>

                        <div className={`w-2 h-2 rounded-full  ${chat.type === "private"
                          ? isPrivateRead(chat)
                          && "bg-blue-600"
                          : isGroupFullyRead(chat)
                          && "bg-blue-600"}`}>
                        </div>

                      </div>
                    </div>

                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">No recent chats</p>
          )}
        </div>

        {/* Users Section - conditionally shown */}
        {showUsers && (
          <div>
            <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase">
              Users
            </p>

            {loading ? (
              <p className="px-3 py-2 text-sm text-gray-500">
                Loading users...
              </p>
            ) : usersData?.users?.length ? (
              <div className="space-y-1">
                {usersData.users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleChat(u._id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">
                      {u.username || u.displayName}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 space-y-2">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <p className="text-sm font-semibold">Settings</p>
            </DrawerHeader>

            <div className="px-2 space-y-1">
              {settings.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100"
                >
                  {/* {item.icon}
                  {item.label} */}
                  {item.button}
                </button>
              ))}
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
