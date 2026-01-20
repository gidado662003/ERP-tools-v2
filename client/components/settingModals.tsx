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
import { useAuthStore } from "@/lib/store";
import { createGroupChat, getAllusers, addUserToGroup } from "@/app/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadFile } from "@/app/api";

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
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await createGroupChat(groupData);

      setSuccess("Group created successfully");
      // Redirect to the new group chat - server returns { group }
      router.push(`/chats/${response.group._id}`);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      setError("Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New Group</Button>
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

interface User {
  _id: string;
  username: string;
  email: string;
}

export function AddToGroup({ chatId }: { chatId: string }) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsersForGroup();
  }, []);

  const fetchUsersForGroup = async () => {
    setLoading(true);
    try {

      const response = await getAllusers();

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

      const response = await addUserToGroup({ userId, chatId });


      // Remove the user from the list since they're now added
      setAllUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setAddingUser(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>

          Add members
        </div>

      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add To Group</DialogTitle>
          <DialogDescription>
            Select users to add to this group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Search users..." />

          <div className="max-h-48 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading users...</p>
            ) : allUsers.length > 0 ? (
              allUsers.map((user) => (
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
                    disabled={addingUser === user._id}
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

export function ImagePreviewModal({ imageUrl, isOpen, onClose, onSend,  // New callback prop
  selectedFile }: {
    imageUrl: string | null;
    isOpen: boolean;
    onClose: () => void;
  }) {
  const handleSend = async () => {
    try {
      const response = await uploadFile(selectedFile);
      const uploadedUrl = response.url;
      onSend(uploadedUrl);
      console.log("response:", response);
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
          <DialogDescription>
            Preview the selected image before sending.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Image Preview"
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSend();
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded">
            Send
          </button>
        </div>
      </DialogContent >
    </Dialog >
  );
}