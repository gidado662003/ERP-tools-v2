const Chat = require("../models/chat.schema");
const User = require("../models/user.schema");
const Message = require("../models/message.schema")
const { makePrivateChatKey } = require("../helper/createPrivateChatId");

async function getOrCreatePrivateChat(userA, userB) {
  // Create normalized key from sorted user IDs
  const privateChatKey = makePrivateChatKey(userA, userB);

  // Try to find an existing private chat using the normalized key
  let chat = await Chat.findOne({
    type: "private",
    privateChatKey: privateChatKey,
  });

  if (!chat) {
    // If not found, create a new one with the normalized key
    chat = await Chat.create({
      type: "private",
      participants: [userA, userB],
      privateChatKey: privateChatKey,
    });
  }

  return chat;
}

async function createGroup(userId, groupName, groupDescription) {
  if (!groupName || !groupDescription) {
    return null;
  }
  const group = await Chat.create({
    type: "group",
    participants: [userId],
    groupName,
    groupDescription,
    groupMembers: [userId],
    groupAdmins: [userId],
    groupMessages: [],
    groupLastMessage: null,
  });
  await User.updateOne(
    { _id: userId }, // filter → which user
    { $push: { joinedRooms: group._id } } // push the group into the array
  );
  if (!group) {
    return null;
  }
  return group;
}

async function getUserChats(userId, search) {
  const matchQuery = {
    participants: userId,
  };

  if (search) {
    const users = await User.find({
      username: { $regex: search, $options: "i" }
    }).select("_id");

    const messages = await Message.find({
      text: { $regex: search, $options: "i" }
    }).select("_id");

    matchQuery.$or = [
      { groupName: { $regex: search, $options: "i" } },
      { participants: { $in: users.map(u => u._id) } },
      { privateLastChat: { $in: messages.map(m => m._id) } },
      { groupLastMessage: { $in: messages.map(m => m._id) } },
    ];
  }

  return Chat.find(matchQuery)
    .populate("participants", "username email avatar")
    .populate("groupMembers", "username avatar")
    .populate({
      path: "privateLastChat",
      select: "readBy text senderId createdAt type fileUrl fileName"
    })
    .populate("groupLastMessage", "readBy text senderId createdAt type fileUrl fileName")
    .sort({ updatedAt: -1 });
}

async function addUserToGroup(userId, chatId, adderId) {
  // Validate chat exists and is a group
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  if (chat.type !== "group") {
    throw new Error("Can only add users to group chats");
  }

  // Check if adder is an admin (for group chats)
  // if (!chat.groupAdmins.includes(adderId)) {
  //   throw new Error("Only group admins can add members");
  // }

  // Check if user is already in group
  if (chat.participants.includes(userId)) {
    throw new Error("User is already in the group");
  }

  // Add user to chat participants
  await Chat.findByIdAndUpdate(chatId, {
    $push: { participants: userId, groupMembers: userId },
  });

  // Add chat to user's joined rooms
  await User.findByIdAndUpdate(userId, {
    $push: { joinedRooms: chatId },
  });

  return { success: true, message: "User added to group" };
}

async function pinMessage(chatId, messageId) {
  try {
    const message = await Message.findOne({
      _id: messageId,
      chatId: chatId
    });

    if (!message) {
      throw new Error('Message not found in this chat');
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { $addToSet: { pinnedMessages: messageId } },
      { new: true }
    ).populate({
      path: "pinnedMessages",
      select: "text senderId createdAt type fileUrl fileName",
      populate: {
        path: "senderId",
        select: "username avatar"
      }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat.pinnedMessages;
  } catch (error) {
    console.error('Error pinning message:', error);
    throw error;
  }
}

async function unpinMessage(chatId, messageId) {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { $pull: { pinnedMessages: messageId } },
      { new: true }
    ).populate({
      path: "pinnedMessages",
      select: "text senderId createdAt type fileUrl fileName",
      populate: {
        path: "senderId",
        select: "username avatar"
      }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat.pinnedMessages;
  } catch (error) {
    console.error('Error unpinning message:', error);
    throw error;
  }
}


module.exports = {
  getOrCreatePrivateChat,
  createGroup,
  getUserChats,
  addUserToGroup,
  pinMessage,
  unpinMessage,
};
