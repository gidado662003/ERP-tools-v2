"use client";

import { useEffect, useState, use, useRef } from "react";
import { socket } from "../../../../../lib/socket";
import {
  FiSend,
  FiWifi,
  FiWifiOff,
  FiUser,
  FiCopy,
  FiTrash2,
  FiMaximize2,
  FiFileText,
  FiDownload,
  FiMapPin,
  FiImage,
  FiFile,
  FiVideo,
  FiPhoneCall,
  FiMoreVertical,
  FiPhoneForwarded,
  FiCornerUpLeft,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { useSocketStore } from "../../../../../store/useSocketStore";
import {
  getPrivateChatById,
  getChatMesssages,
  pinChat,
  deleteMessage,
} from "@/app/api";
import { useAuthStore } from "@/lib/store";
import { AddToGroup, GroupInfoModal } from "@/components/settingModals";
import { SettingDropdown } from "@/components/settingDropdDown";
import { ForwardeMessageModal } from "@/components/settingModals";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import type {
  User,
  Message,
  GroupInfo,
  ReplyToSnapshot,
} from "@/lib/chatTypes";

interface ChatPageProps {
  params: Promise<{ id: string }>;
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
  const [typing, setTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [cursorTimestamp, setCursorTimestamp] = useState<string>("");
  const [cursorId, setCursorId] = useState("");
  const currentUserId = currentUser?._id ?? "";
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingOlderMessagesRef = useRef<boolean>(false);
  const lastMessageIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_FILE_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "";

  useEffect(() => {
    if (chat?.type === "group") {
      const lastAtIndex = message.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const textAfterAt = message.slice(lastAtIndex + 1);
        const hasSpace = textAfterAt.includes(" ");
        if (!hasSpace) {
          setMentionQuery(textAfterAt.toLowerCase());
          setIsMentionOpen(true);
        } else {
          setIsMentionOpen(false);
          setMentionQuery("");
        }
      } else {
        setIsMentionOpen(false);
        setMentionQuery("");
      }
    } else {
      setIsMentionOpen(false);
      setMentionQuery("");
    }
  }, [message, chat?.type]);

  const filteredParticipants =
    chat?.participants?.filter((part: any) =>
      part.username.toLowerCase().includes(mentionQuery),
    ) || [];

  const getDateKey = (isoDate: string) => {
    const d = new Date(isoDate);
    return d.toISOString().split("T")[0];
  };

  const messagesToShow =
    messageSearchQuery.trim() === ""
      ? messages
      : messages.filter((msg) => {
          const q = messageSearchQuery.toLowerCase();
          const text = (msg.text ?? "").toLowerCase();
          const fileName = (msg.fileName ?? "").toLowerCase();
          return text.includes(q) || fileName.includes(q);
        });

  const groupedMessages = messagesToShow.reduce(
    (acc: Record<string, Message[]>, msg) => {
      const dayKey = getDateKey(msg.createdAt);
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(msg);
      return acc;
    },
    {},
  );

  const formatDayLabel = (dayKey: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const dayDate = new Date(dayKey);
    if (dayDate.toDateString() === today.toDateString()) return "Today";
    if (dayDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    return new Date(dayKey).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const fetchChat = async () => {
      try {
        const response = await getPrivateChatById(id);
        const messagesData = await getChatMesssages(
          response.chat._id,
          cursorTimestamp,
          cursorId,
        );
        setChat(response.chat);
        const initialMessages = [...messagesData.data.messages].reverse();
        setMessages(initialMessages);
        if (initialMessages.length > 0) {
          lastMessageIdRef.current =
            initialMessages[initialMessages.length - 1]._id;
        }
        if (
          messagesData.data.nextCursor?.timestamp &&
          messagesData.data.nextCursor?.id
        ) {
          setCursorTimestamp(messagesData.data.nextCursor.timestamp);
          setCursorId(messagesData.data.nextCursor.id);
          setHasMoreMessages(messagesData.data.hasMore);
        } else {
          setCursorTimestamp("");
          setCursorId("");
          setHasMoreMessages(false);
        }
        if (response.chat.type === "group") {
          setUser(null);
          setGroupInfo({
            name: response.chat.groupName,
            description: response.chat.groupDescription,
            members: response.chat.groupMembers,
            admins: response.chat.groupAdmins,
          });
        } else {
          setUser(response.otherUser);
          setGroupInfo(null);
        }
      } catch (error) {
        console.error("Failed to fetch chat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChat();
  }, [id]);

  async function handleGetMessages() {
    if (!chat?._id || isLoading || !scrollContainerRef.current) return;
    isLoadingOlderMessagesRef.current = true;
    const container = scrollContainerRef.current;
    const prevScrollHeight = container.scrollHeight;
    const newMessagesData = await getChatMesssages(
      chat._id,
      cursorTimestamp,
      cursorId,
    );
    if (
      newMessagesData.data.nextCursor?.timestamp &&
      newMessagesData.data.nextCursor?.id
    ) {
      setCursorTimestamp(newMessagesData.data.nextCursor.timestamp);
      setCursorId(newMessagesData.data.nextCursor.id);
    } else {
      setHasMoreMessages(false);
    }
    const olderMessages = [...newMessagesData.data.messages].reverse();
    setMessages((prevMessages) => {
      const existingIds = new Set(prevMessages.map((m) => m._id));
      const uniqueOlder = olderMessages.filter(
        (m: Message) => !existingIds.has(m._id),
      );
      return [...uniqueOlder, ...prevMessages];
    });
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop += newScrollHeight - prevScrollHeight;
      isLoadingOlderMessagesRef.current = false;
    });
  }

  useEffect(() => {
    if (!id) return;
    socket.emit("join_chat", id);
    socket.emit("mark_as_read", { chatId: id, userId: currentUserId });
    return () => {
      socket.emit("leave_chat", id);
    };
  }, [id, currentUserId]);

  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      if (msg.chatId !== id) return;
      setMessages((prev) => [...prev, msg]);
      socket.emit("mark_as_read", { chatId: id, userId: currentUserId });
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [id, currentUserId]);

  useEffect(() => {
    const handleMessagesRead = ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      if (chatId !== id) return;
      let readingUser =
        chat?.type === "group"
          ? groupInfo?.members.find((member) => member._id === userId)
          : user?._id === userId
            ? user
            : undefined;
      if (!readingUser) return;
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.readBy?.some((u) => u._id === userId)) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), readingUser as User],
            };
          }
          return msg;
        }),
      );
    };
    socket.on("messages_read", handleMessagesRead);
    return () => {
      socket.off("messages_read", handleMessagesRead);
    };
  }, [id, chat, user, groupInfo]);

  const displayName =
    (currentUser as { displayName?: string })?.displayName ??
    currentUser?.username ??
    currentUser?.email?.split("@")[0] ??
    "Someone";

  function handleTyping() {
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId: id, user: displayName });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId: id, userId: currentUserId });
      setTyping(false);
    }, 1000);
  }

  useEffect(() => {
    const onUserTyping = ({
      chatId,
      user,
    }: {
      chatId: string;
      user: string;
    }) => {
      if (chatId === id) setTypingUser(user);
    };
    const onUserStopTyping = ({ chatId }: { chatId: string }) => {
      if (chatId === id) setTypingUser(null);
    };
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);
    return () => {
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
    };
  }, [id]);

  useEffect(() => {
    const handleMessageDeleted = ({
      messageId,
      chatId,
    }: {
      messageId: string;
      chatId: string;
    }) => {
      if (chatId === id) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeleted: true, text: "Message deleted" }
              : msg,
          ),
        );
      }
    };
    socket.on("message_was_deleted", handleMessageDeleted);
    return () => {
      socket.off("message_was_deleted", handleMessageDeleted);
    };
  }, [id]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage?._id !== lastMessageIdRef.current;
    if (isNewMessage) {
      lastMessageIdRef.current = lastMessage?._id || null;
    }
    if (isLoadingOlderMessagesRef.current) return;
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "instant", block: "end" });
      }
    });
  }, [messages, typingUser]);

  const sendMessage = () => {
    if (!message.trim()) return;
    let mentions: string[] | undefined = undefined;
    if (chat?.type === "group" && Array.isArray(chat.participants)) {
      const mentionedUsernames = Array.from(
        new Set(
          (message.match(/@([a-zA-Z0-9_]+)/g) || []).map((m) =>
            m.slice(1).toLowerCase(),
          ),
        ),
      );
      if (mentionedUsernames.length > 0) {
        const usernameToId = new Map<string, string>();
        chat.participants.forEach((p: any) => {
          if (p?.username && p?._id) {
            usernameToId.set(p.username.toLowerCase(), p._id);
          }
        });
        mentions = mentionedUsernames
          .map((uname) => usernameToId.get(uname))
          .filter((id): id is string => Boolean(id));
      }
    }
    socket.emit("send_message", {
      chatId: id,
      text: message,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
      replyToMessageId: replyingTo?._id || null,
      mentions,
    });
    setMessage("");
    setReplyingTo(null);
  };

  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getReadStatus = (msg: Message) => {
    if (chat?.type === "group") {
      if (!groupInfo) return "";
      const otherMembers = groupInfo.members.filter(
        (m) => m._id !== currentUserId,
      );
      const readCount =
        msg.readBy?.filter((u) => otherMembers.some((m) => m._id === u._id))
          .length || 0;
      if (readCount === 0) return "Sent";
      return readCount === otherMembers.length
        ? "Seen by all"
        : `Seen by ${readCount}`;
    }
    return msg.readBy?.some((u) => u._id === user?._id) ? "Read" : "Sent";
  };

  const messagePin = async (messageId: string, action: string) => {
    try {
      await pinChat(id, messageId, action);
      socket.emit("update_pin", { chatId: id, messageId, action });
    } catch (error) {
      console.error("Failed to pin/unpin message:", error);
    }
  };

  useEffect(() => {
    const handlePinUpdate = async ({ chatId }: { chatId: string }) => {
      if (chatId === id) {
        try {
          const updatedChat = await getPrivateChatById(id);
          setChat(updatedChat.chat);
        } catch (error) {
          console.error("Failed to update pinned messages:", error);
        }
      }
    };
    socket.on("pin_updated", handlePinUpdate);
    return () => {
      socket.off("pin_updated", handlePinUpdate);
    };
  }, [id]);

  useEffect(() => {
    const handleOnlineStatus = ({
      userId,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      if (user && userId === user._id) {
        const isOnline = status === "online";
        setUser((prevUser) => (prevUser ? { ...prevUser, isOnline } : null));
      }
    };
    socket.on("user_status_changed", handleOnlineStatus);
    return () => {
      socket.off("user_status_changed", handleOnlineStatus);
    };
  }, [user?._id]);

  const isLessThan10Minutes = (createdAt: string | Date) => {
    const diffInMinutes =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
    return diffInMinutes < 10;
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    socket.emit("message_delete", { messageId, chatId: id });
  };

  const handleReplyToMessage = (msg: Message) => {
    setReplyingTo(msg);
  };

  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-message");
      setTimeout(() => {
        element.classList.remove("highlight-message");
      }, 2000);
    }
  };

  const ReplyPreview = ({ reply }: { reply: ReplyToSnapshot }) => {
    const getReplyContent = () => {
      if (reply.type === "image") return "📷 Photo";
      if (reply.type === "video") return "🎬 Video";
      if (reply.type === "file") return `📎 ${reply.fileName}`;
      return reply.text;
    };
    return (
      <div
        className="border-l-4 border-blue-500 pl-3 py-2 mb-2 bg-blue-50/50 rounded cursor-pointer hover:bg-blue-100/50 transition-colors"
        onClick={() => scrollToMessage(reply._id)}
      >
        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">
          {reply.senderId.username}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {getReplyContent()}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden">
            <SidebarTrigger className="h-8 w-8" />
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            {(chat?.type === "group" ? groupInfo?.name : user?.username)
              ?.charAt(0)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-800 truncate">
              {chat?.type === "group" ? groupInfo?.name : user?.username}
            </h1>
            <div
              className={`text-xs flex items-center gap-1 ${user?.isOnline ? "text-green-600" : "text-gray-400"}`}
            >
              {user?.isOnline ? (
                <>
                  <FiWifi size={10} /> Online
                </>
              ) : (
                <>
                  <FiWifiOff size={10} /> Offline
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => alert("Coming soon...")}
          >
            <FiPhoneCall size={18} />
          </button>
          {chat && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                  <FiMoreVertical size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setIsSearchOpen(true);
                    setMessageSearchQuery("");
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }}
                  className="gap-2"
                >
                  <FiSearch size={16} />
                  Search messages
                </DropdownMenuItem>
                {chat?.type === "group" && (
                  <>
                    <DropdownMenuSeparator />
                    {chat.groupAdmins.includes(currentUserId) && (
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <AddToGroup chatId={id} />
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <GroupInfoModal chatId={id} />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* SEARCH BAR */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50">
          <FiSearch className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search messages..."
            value={messageSearchQuery}
            onChange={(e) => setMessageSearchQuery(e.target.value)}
            className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false);
              setMessageSearchQuery("");
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* PINNED MESSAGES */}
      {chat?.pinnedMessages && chat.pinnedMessages.length > 0 && (
        <div className="bg-yellow-50 border-b px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-yellow-700 mb-1">
            <FiMapPin size={12} />
            <span className="font-medium">Pinned messages</span>
          </div>
          <div className="space-y-1">
            {chat.pinnedMessages.slice(0, 2).map((pinnedMsg: Message) => (
              <div key={pinnedMsg._id} className="text-sm truncate">
                <span className="font-medium text-gray-700">
                  {pinnedMsg?.senderId?.username}:
                </span>{" "}
                <span className="text-gray-600">
                  {pinnedMsg.type === "text"
                    ? pinnedMsg.text
                    : pinnedMsg.type === "image"
                      ? "📷 Image"
                      : pinnedMsg.type === "video"
                        ? "🎬 Video"
                        : `📎 ${pinnedMsg.fileName}`}
                </span>
              </div>
            ))}
            {chat.pinnedMessages.length > 2 && (
              <div className="text-xs text-gray-500">
                +{chat.pinnedMessages.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto px-4">
          <div className="flex justify-center py-4">
            {hasMoreMessages && (
              <button
                onClick={handleGetMessages}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Load older messages
              </button>
            )}
          </div>

          <div className="pb-4 space-y-4">
            {Object.entries(groupedMessages).map(([dayKey, dayMessages]) => (
              <div key={dayKey} className="space-y-4">
                <div className="flex justify-center">
                  <span className="px-3 py-1 text-xs bg-gray-200 rounded-full text-gray-600">
                    {formatDayLabel(dayKey)}
                  </span>
                </div>

                {dayMessages.map((msg) => {
                  const isMine = msg.senderId?._id === currentUserId;
                  const mentionsMe = msg.mentions?.includes(currentUserId);

                  return (
                    <div
                      key={msg._id}
                      ref={(el: any) => (messageRefs.current[msg._id] = el)}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <ContextMenu>
                        <ContextMenuTrigger className="max-w-[85%] sm:max-w-[70%]">
                          <div
                            className={`relative rounded-lg px-3 py-2 shadow-sm
                              ${
                                isMine
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-800"
                              }
                              ${mentionsMe ? "ring-2 ring-blue-400" : ""}`}
                          >
                            {!isMine && (
                              <div className="text-xs font-medium flex items-center gap-1 mb-0.5 text-gray-600">
                                <FiUser size={10} />
                                {msg?.senderId?.username}
                              </div>
                            )}

                            {msg.replyToSnapshot && (
                              <ReplyPreview reply={msg.replyToSnapshot} />
                            )}

                            {msg.isDeleted ? (
                              <p className="text-sm italic text-gray-400">
                                Message deleted
                              </p>
                            ) : (
                              <>
                                {msg.forwardedMessage && (
                                  <span className="text-xs italic opacity-70 block mb-0.5">
                                    Forwarded
                                  </span>
                                )}

                                {/* IMAGE - fixed size */}
                                {msg.type === "image" && (
                                  <div className="mb-1 max-w-[200px]">
                                    <img
                                      src={`${API_URL}${msg.fileUrl}`}
                                      alt={msg.fileName}
                                      className="w-full h-auto max-h-[200px] object-contain rounded cursor-pointer"
                                      onClick={() =>
                                        window.open(`${API_URL}${msg.fileUrl}`)
                                      }
                                    />
                                  </div>
                                )}

                                {/* VIDEO */}
                                {msg.type === "video" && (
                                  <div className="mb-1 max-w-[200px]">
                                    <video
                                      src={`${API_URL}${msg.fileUrl}`}
                                      className="w-full rounded"
                                      controls
                                    />
                                  </div>
                                )}

                                {/* FILE */}
                                {msg.type === "file" && (
                                  <a
                                    href={`${API_URL}${msg.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded border mb-1 no-underline
                                      ${
                                        isMine
                                          ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-700"
                                          : "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                                      }`}
                                  >
                                    <FiFileText size={16} />
                                    <span className="text-sm truncate">
                                      {msg.fileName || "Document"}
                                    </span>
                                  </a>
                                )}

                                {/* TEXT */}
                                {msg.text && (
                                  <p className="text-sm break-words whitespace-pre-wrap">
                                    {msg.text}
                                  </p>
                                )}
                              </>
                            )}

                            <div className="text-[10px] mt-1 flex justify-end items-center gap-1 opacity-60">
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMine && <span>• {getReadStatus(msg)}</span>}
                            </div>
                          </div>
                        </ContextMenuTrigger>

                        {!msg.isDeleted && (
                          <ContextMenuContent className="w-48">
                            <ContextMenuItem
                              onClick={() => handleReplyToMessage(msg)}
                              className="gap-2"
                            >
                              <FiCornerUpLeft size={14} /> Reply
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() => copyToClipboard(msg?.text)}
                              className="gap-2"
                            >
                              <FiCopy size={14} /> Copy
                            </ContextMenuItem>
                            <ContextMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <FiPhoneForwarded size={14} />
                              <ForwardeMessageModal messageToForward={msg} />
                            </ContextMenuItem>
                            {msg.fileUrl && (
                              <ContextMenuItem
                                onClick={() =>
                                  window.open(`${API_URL}${msg.fileUrl}`)
                                }
                                className="gap-2"
                              >
                                <FiMaximize2 size={14} /> Open
                              </ContextMenuItem>
                            )}
                            <ContextMenuItem
                              onClick={() => {
                                const isPinned = chat?.pinnedMessages?.some(
                                  (pinned: Message) => pinned._id === msg._id,
                                );
                                messagePin(msg._id, isPinned ? "unpin" : "pin");
                              }}
                              className="gap-2"
                            >
                              <FiMapPin size={14} />
                              {chat?.pinnedMessages?.some(
                                (pinned: Message) => pinned._id === msg._id,
                              )
                                ? "Unpin"
                                : "Pin"}
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            {isMine && isLessThan10Minutes(msg.createdAt) && (
                              <ContextMenuItem
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="gap-2 text-red-500 focus:text-red-500"
                              >
                                <FiTrash2 size={14} /> Delete
                              </ContextMenuItem>
                            )}
                          </ContextMenuContent>
                        )}
                      </ContextMenu>
                    </div>
                  );
                })}
              </div>
            ))}

            {typingUser && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                {typingUser} is typing
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </main>

      {/* FOOTER - Fixed for mobile */}
      <footer className="border-t bg-white">
        {/* Reply Banner */}
        {replyingTo && (
          <div className="px-4 py-2 bg-blue-50 border-l-4 border-blue-500 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-blue-600 mb-0.5">
                Replying to {replyingTo?.senderId?.username}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {replyingTo.type === "text"
                  ? replyingTo.text
                  : replyingTo.type === "image"
                    ? "📷 Photo"
                    : replyingTo.type === "video"
                      ? "🎬 Video"
                      : `📎 ${replyingTo.fileName}`}
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-2 p-1 hover:bg-blue-100 rounded-full shrink-0"
            >
              <FiX size={16} className="text-gray-500" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 p-2">
          <SettingDropdown />
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
              className="w-full rounded-lg px-3 py-2 bg-gray-100 border-0 focus:ring-1 focus:ring-blue-500 text-sm resize-none max-h-24"
              placeholder="Message..."
              style={{
                minHeight: "40px",
                maxHeight: "96px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "40px";
                target.style.height = Math.min(target.scrollHeight, 96) + "px";
              }}
            />

            {/* Mention Dropdown */}
            {isMentionOpen && filteredParticipants.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {filteredParticipants.map((part: any) => (
                  <button
                    key={part._id}
                    onClick={() => {
                      const lastAtIndex = message.lastIndexOf("@");
                      const beforeAt = message.slice(0, lastAtIndex);
                      setMessage(beforeAt + `@${part.username} `);
                      setIsMentionOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shrink-0">
                      {part.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{part.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white p-2.5 rounded-lg transition-colors shrink-0"
          >
            <FiSend size={18} />
          </button>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes highlight {
          0%,
          100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(59, 130, 246, 0.2);
          }
        }
        .highlight-message {
          animation: highlight 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
