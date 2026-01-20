const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
      required: true,
    },
    privateChat: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    privateLastChat: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    privateChatKey: { type: String, unique: true, sparse: true },
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: null },
    groupDescription: { type: String, default: null },
    groupAvatar: { type: String, default: null },
    groupMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    groupLastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Remove the problematic index on participants array
// Use privateChatKey instead for unique private chats
chatSchema.index(
  { privateChatKey: 1 },
  { unique: true, sparse: true, partialFilterExpression: { type: "private" } }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
