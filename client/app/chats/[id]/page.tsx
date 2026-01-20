"use client";

import { useEffect, useState, use, useRef } from "react";
import { socket } from "../../../lib/socket";
import { FiSend, FiWifi, FiWifiOff, FiUser, FiPaperclip } from "react-icons/fi";
import { useSocketStore } from "../../../store/useSocketStore";
import { getPrivateChatById } from "@/app/api";
import { useAuthStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddToGroup } from "@/components/settingModals";
import { SettingDropdown } from "@/components/settingDropdDown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImagePreviewModal } from "@/components/settingModals"


interface ChatPageProps {
  params: Promise<{ id: string }>;
}

interface User {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
  isOnline?: boolean;
}

interface Message {
  _id?: string;
  text: string;
  senderId: User;
  chatId: string;
  createdAt: string;
  type: string;
  fileUrl: string;
  fileName: string
  readBy: User[];
}

interface GroupInfo {
  name: string;
  description: string;
  members: User[];
  admins: User[];
}



export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  const { user: currentUser } = useAuthStore();
  const isConnected = useSocketStore((state) => state.isConnected);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [chat, setChat] = useState<any>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [typing, setTyping] = useState<boolean>(false)
  const [typingUser, setTypingUser] = useState<string | null>(null);


  const currentUserId = currentUser?._id ?? "";
  const scrollRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (!id) return;

    const fetchChat = async () => {
      try {
        const response = await getPrivateChatById(id);
        setChat(response.chat);

        if (response.chat.type === "group") {
          setUser(null);
          setGroupInfo({
            name: response.chat.groupName,
            description: response.chat.groupDescription,
            members: response.chat.groupMembers,
            admins: response.chat.groupAdmins,
          });
          setMessages(response.chat.groupMessages || []);
        } else {
          setUser(response.otherUser);
          setGroupInfo(null);
          setMessages(response.chat.privateChat || []);
        }
      } catch (error) {
        console.error("Failed to fetch chat:", error);
      }
    };

    fetchChat();
  }, [id]);

  /* ================= SOCKET JOIN / LEAVE ================= */

  useEffect(() => {
    if (!id) return;

    socket.emit("join_chat", id);

    return () => {
      socket.emit("leave_chat", id);
    };
  }, [id]);

  /* ================= RECEIVE MESSAGE ================= */

  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      if (msg.chatId !== id) return;

      setMessages((prev) => [...prev, msg]);

      socket.emit("mark_as_read", {
        chatId: id,
        userId: currentUserId,
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [id, currentUserId]);

  /* ================= MARK AS READ ON OPEN ================= */

  useEffect(() => {
    socket.emit("mark_as_read", {
      chatId: id,
      userId: currentUserId,
    });
  }, [id, currentUserId]);

  useEffect(() => {
    const handleMessagesRead = ({ chatId, userId }: any) => {
      if (chatId !== id) return;

      setMessages((prev) =>
        prev.map((msg) => {
          const alreadyRead = msg.readBy?.some(
            (u) => u._id === userId
          );

          if (alreadyRead) return msg;

          return {
            ...msg,
            readBy: [...(msg.readBy || []), { _id: userId } as any],
          };
        })
      );
    };

    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("messages_read", handleMessagesRead);
    };
  }, [id]);


  /* ================= Typing ================= */
  let typingTimeout: NodeJS.Timeout;
  function handleTyping() {
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        chatId: id,
        user: currentUser?.username,
      });
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop_typing", {
        chatId: id,
        userId: currentUser?.username,
      });
      setTyping(false);
    }, 4000);
  }

  useEffect(() => {
    socket.on("user_typing", ({ user }) => {
      setTypingUser(user)
    })
    socket.on("user_stop_typing", () => {
      setTypingUser(null)
    })
    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [])


  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      chatId: id,
      text: message,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    });

    setMessage("");
  };

  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });



  // PRIVATE CHAT
  const getPrivateReadStatus = (msg: Message) => {
    if (!user) return "Sent";

    const otherUserHasRead = msg.readBy?.some(
      (u) => u._id === user._id
    );

    return otherUserHasRead ? "Read" : "Sent";
  };

  // GROUP CHAT
  const getGroupReadStatus = (msg: Message) => {

    if (!groupInfo) return "";

    const otherMembers = groupInfo.members.filter(
      (m) => m._id !== currentUserId
    );

    const readCount =
      msg.readBy?.filter((u) =>
        otherMembers.some((m) => m?.toString() === u._id.toString())
      ).length || 0;
    if (readCount === 0) return "Sent";
    if (readCount === otherMembers.length) return "Seen by all";

    return `Seen by ${readCount}`;
  };



  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ---------- HEADER ---------- */}
      <header className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="font-bold uppercase">
            {chat?.type === "group"
              ? groupInfo?.name
              : user?.username}
          </h1>
          <div>
            Members {chat?.type === "group" && (groupInfo?.members.length)}
          </div>

          {chat?.type === "private" && (
            <div
              className={`text-xs flex items-center gap-1 ${isConnected ? "text-green-600" : "text-red-600"
                }`}
            >
              {isConnected ? <FiWifi /> : <FiWifiOff />}
              {isConnected ? "Online" : "Offline"}
            </div>
          )}
        </div>

        {chat?.type === "group" &&
          chat.groupAdmins.includes(currentUserId) && (
            <DropdownMenu>
              <DropdownMenuTrigger>Open</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Group</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <AddToGroup chatId={id} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
      </header>

      {/* messages */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="py-4 space-y-4">
            {messages.map((msg) => {
              const isMine = msg.senderId._id === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`rounded-xl px-4 py-2 max-w-[70%] ${isMine
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                      }`}
                  >
                    {!isMine && (
                      <div className="text-[10px] font-bold flex items-center gap-1">
                        <FiUser /> {msg.senderId.username}
                      </div>
                    )}

                    {msg.type === "image" ? (
                      <>
                        <div>

                        </div>
                        <img
                          src={`http://localhost:5000${msg.fileUrl}`}
                          alt={msg.fileName || "Image"}
                          className="max-w-full max-h-48 rounded-lg object-contain"
                          onClick={() => window.open(`http://localhost:5000${msg.fileUrl}`)}
                        />
                      </>
                    ) : (
                      <p>{msg.text}</p>
                    )}



                    <div className="text-[10px] text-right opacity-70 mt-1">
                      {isMine &&
                        (chat?.type === "group"
                          ? getGroupReadStatus(msg)
                          : getPrivateReadStatus(msg))}
                      {" · "}
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            {typingUser && (
              <p className="text-xs italic text-gray-500">
                {typingUser} is typing...
              </p>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </main>


      <footer className="p-4 border-t bg-white flex items-center gap-3">
        {/* Attachment Button */}
        <SettingDropdown />

        {/* Input Field */}
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping()
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded-2xl px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          placeholder="Write a message..."
        />

        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
        >
          <FiSend size={20} />
        </button>
      </footer>
    </div>
  );
}
