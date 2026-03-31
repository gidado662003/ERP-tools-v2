import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import { useAuthStore } from "@/lib/store";
import {
  createGroupChat,
  getAllusers,
  addUserToGroup,
  createOrGetPrivateChat,
  getGroupInfo,
  getUserChats,
  updateGroupAdmin,
} from "@/app/api";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/app/api";
import { socket } from "@/lib/socket";
import type { User, Chat, Message } from "@/lib/chatTypes";

export function CreateGroupChatModal() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [allUsers, setGetAllUsers] = useState();
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [groupAdmins, setGroupAdmins] = useState<string[]>([]);
  const [groupMessages, setGroupMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [groupData, setGroupData] = useState({
    groupName: groupName,
    groupDescription: groupDescription,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupData({
      ...groupData,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllusers();

      setGetAllUsers(response.data?.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupData.groupName?.trim()) {
      setError("Group name is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await createGroupChat(groupData);

      setSuccess("Group created successfully");
      // Redirect to the new group chat - server returns { group }
      router.push(`${response.group._id}`);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      setError("Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Prevent closing while request is in-flight
        if (isLoading) return;
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setOpen(true);
          }}
        >
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>
            Create a new group chat with your friends.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="groupName"
              name="groupName"
              value={groupData.groupName}
              onChange={handleChange}
              placeholder="Enter group name"
            />
            <Input
              id="groupDescription"
              name="groupDescription"
              value={groupData.groupDescription}
              onChange={handleChange}
              placeholder="Enter group description"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {success && <p className="text-xs text-green-600 mt-1">{success}</p>}
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={handleCreateGroup}>
            {isLoading ? "Creating Group..." : "Create Group"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddToGroup({ chatId }: { chatId: string }) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsersForGroup();
  }, [search]);

  const fetchUsersForGroup = async () => {
    setLoading(true);
    try {
      const response = await getAllusers(search);
      setAllUsers(response.data?.users || []);
    } catch (error) {
      console.error("AddToGroup: Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userId: string) => {
    if (!chatId) {
      console.error("No chatId provided");
      return;
    }

    setAddingUser(userId);
    try {
      await addUserToGroup({ userId, chatId });
      // Remove the user from the list since they're now added
      setAllUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setAddingUser(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>Add members</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add To Group</DialogTitle>
          <DialogDescription>
            Select users to add to this group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-48 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading users...</p>
            ) : allUsers.length > 0 ? (
              allUsers
                .filter((user) =>
                  user.username.toLowerCase().includes(search.toLowerCase()),
                )
                .map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleAddUser(user._id)}
                      disabled={
                        addingUser === user._id ||
                        user?.joinedRooms?.includes(chatId)
                      }
                      className="ml-auto px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {addingUser === user._id ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ImagePreviewModal({
  imageUrl,
  isOpen,
  onClose,
  onSend, // New callback prop
  selectedFile,
}: {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (uploadedUrl: string, type: string) => void;
  selectedFile: File | null;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    try {
      const response = await uploadFile(selectedFile);
      const uploadedUrl = response.url;
      let type = "file"; // default
      if (selectedFile.type.startsWith("image/")) {
        type = "image";
      } else if (selectedFile.type.startsWith("video/")) {
        type = "video";
      } else {
        type = "file"; // for documents
      }
      onSend(uploadedUrl, type);
      onClose();
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = !!selectedFile && selectedFile.type.startsWith("image/");
  const isVideo = !!selectedFile && selectedFile.type.startsWith("video/");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing while upload is in progress
        if (!open && !isUploading) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>File Preview</DialogTitle>
          <DialogDescription>
            Preview the selected file before sending.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          {isImage && imageUrl && (
            <img
              src={imageUrl}
              alt="Image Preview"
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          )}
          {isVideo && imageUrl && (
            <video
              src={imageUrl}
              className="max-w-full max-h-96 rounded-lg"
              controls
            />
          )}
          {!isImage && !isVideo && selectedFile && (
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 w-full">
              <div className="p-2 rounded-lg bg-gray-200 text-gray-700">
                <FiFileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isUploading || !selectedFile}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "Sending..." : "Send"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GroupInfoModal({ chatId }: { chatId: string }) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetchGroupInfo();
  }, []);
  const fetchGroupInfo = async () => {
    try {
      const response = await getGroupInfo(chatId);
      setGroupInfo(response.group);
    } catch (error) {
      console.error("Failed to fetch group info:", error);
    }
  };

  const currentUserIsAdmin =
    !!currentUser &&
    groupInfo?.admins?.some((admin: User) => admin._id === currentUser._id);

  const handleMakeAdmin = async (userId: string) => {
    if (!currentUserIsAdmin) return;
    setUpdatingAdminId(userId);
    try {
      await updateGroupAdmin({ userId, chatId });
      await fetchGroupInfo();
    } catch (error) {
      console.error("Failed to promote user to admin:", error);
    } finally {
      setUpdatingAdminId(null);
    }
  };
  const goToChat = async (userId: string) => {
    try {
      const response = await createOrGetPrivateChat(userId);
      if (response && response.chat) {
        router.push(`${response.chat._id}`);
      }
    } catch (error) {
      console.error("Failed to create/get private chat:", error);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <button>Group Info</button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {groupInfo ? (
            <div className="space-y-6">
              {/* Group Avatar and Basic Info */}
              {/* Top Section */}
              <center>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {groupInfo.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {groupInfo.name}
                </h3>
              </center>

              {/* Bottom Section */}
              <div className="flex items-center gap-4 p-4 rounded-xl border">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Created {new Date(groupInfo.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {groupInfo.memberCount} members
                    </span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {groupInfo.admins?.length || 0} admins
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {groupInfo.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-gray-800 leading-relaxed">
                    {groupInfo.description}
                  </p>
                </div>
              )}

              {/* Admins Section */}
              {groupInfo.admins && groupInfo.admins.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                    Group Admins ({groupInfo.admins.length})
                  </h4>
                  <div className="space-y-2">
                    {groupInfo.admins.map((admin: User) => (
                      <div
                        key={admin._id}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {admin.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {admin.username}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Administrator
                          </p>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${admin.isOnline ? "bg-green-400" : "bg-gray-300"}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Section */}
              {groupInfo.members && groupInfo.members.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Group Members ({groupInfo.members.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {groupInfo.members.map((member: User) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {member.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${member.isOnline ? "bg-green-400" : "bg-gray-300"}`}
                          ></div>
                          <button
                            onClick={() => goToChat(member._id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Message
                          </button>
                          {currentUserIsAdmin &&
                            !groupInfo.admins.some(
                              (admin: User) => admin._id === member._id,
                            ) && (
                              <button
                                onClick={() => handleMakeAdmin(member._id)}
                                disabled={updatingAdminId === member._id}
                                className="text-xs text-green-700 hover:underline disabled:opacity-50"
                              >
                                {updatingAdminId === member._id
                                  ? "Making admin..."
                                  : "Make admin"}
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Loading group information...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ForwardeMessageModal({
  messageToForward,
}: {
  messageToForward: Message;
}) {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await getUserChats("");
      setChatList(response.data?.chats || response.chats || []);
    } catch (error) {
      console.error("Fetch chats error:", error);
    }
  };

  const handleForwardMessage = async (chatId: string) => {
    setForwarding(true);
    try {
      socket.emit("send_message", {
        chatId: chatId,
        text: messageToForward.text,
        type: messageToForward.type,
        fileUrl: messageToForward.fileUrl || "",
        fileName: messageToForward.fileName || "",
        senderId: currentUser?._id,
        timestamp: new Date().toISOString(),
        forwardedFrom: messageToForward._id,
        originalSender: messageToForward.senderId,
        originalChatId: messageToForward.chatId,
        forwardedMessage: true,
      });

      router.push(`/chat/chats/${chatId}`);
    } catch (error) {
      console.error("Failed to forward message:", error);
    } finally {
      setForwarding(false);
    }
  };

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === "group") {
      return chat.groupName || "Group Chat";
    } else {
      // For private chat, find the other participant's name
      const otherParticipant = chat.participants?.find(
        (p) => p._id !== currentUser?._id,
      );
      return otherParticipant?.username || "Private Chat";
    }
  };

  const getMemberCount = (chat: Chat): number => {
    if (chat.type === "group") {
      return chat.groupMembers?.length || 0;
    } else {
      return chat.participants?.length || 2;
    }
  };

  const filteredChats = chatList.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Forward message</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
          <DialogDescription>
            Select a chat to forward this message to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {getChatDisplayName(chat)?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {getChatDisplayName(chat)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {chat.type === "group"
                          ? `${getMemberCount(chat)} members`
                          : "Private chat"}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleForwardMessage(chat._id)}
                    disabled={forwarding}
                  >
                    {forwarding ? "Forwarding..." : "Forward"}
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No chats found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
