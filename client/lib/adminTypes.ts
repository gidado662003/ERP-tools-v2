export type AdminUser = {
  _id: string;
  username: string;
  email: string;
  role?: string;
  isOnline: string;
  lastSeen: Date;
  avatar?: string | null;
};

export type AdminChat = {
  _id: string;
  type: "private" | "group";
  groupName?: string | null;
  participants?: AdminUser[];
  groupMembers?: AdminUser[];
  updatedAt?: string;
  createdAt?: string;
};

export type AdminMessage = {
  _id: string;
  text: string;
  type?: "text" | "image" | "file";
  fileUrl?: string;
  createdAt?: string;
  senderId?: Pick<AdminUser, "_id" | "username" | "avatar"> | null;
  isDeleted?: boolean;
};
