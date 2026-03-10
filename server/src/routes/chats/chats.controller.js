const {
  getOrCreatePrivateChat,
  createGroup,
  getUserChats,
  addUserToGroup,
  pinMessage,
  unpinMessage,
  getOrCreateTicketsGroup,
  addAdminToGroup,
} = require("../../services/chat.service");
const Chat = require("../../models/chat.schema");
const Message = require("../../models/message.schema");
const Ticket = require("../../models/ticket.schema");
// Controller to handle API request
async function createOrGetPrivateChat(req, res) {
  try {
    const userId = req.userId; // logged-in user
    const { otherUserId } = req.body; // the user you want to chat with

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID required" });
    }

    const chat = await getOrCreatePrivateChat(userId, otherUserId);

    res.status(200).json({ chat });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function createGroupChat(req, res) {
  try {
    const userId = req.userId; // logged-in user
    const { groupName, groupDescription } = req.body;
    const group = await createGroup(userId, groupName, groupDescription);
    if (!group) {
      return res.status(400).json({ message: "Failed to create group" });
    }
    res.status(200).json({ group });
  } catch (err) {
    console.error("Group chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
// NEW function - finds chat by ID and returns other user info
async function getChatWithUser(req, res) {
  try {
    const userId = req.userId; // logged-in user
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID required" });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Find the other participant (not the current user)
    const otherUser = chat.participants.find(
      (user) => user._id.toString() !== userId,
    );

    if (!otherUser) {
      return res.status(400).json({ message: "Invalid chat participants" });
    }

    res.status(200).json({
      chat,
      otherUser, // Now populated with full user data
    });
  } catch (err) {
    console.error("Get chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
async function getPrivateChatById(req, res) {
  try {
    const { chatId } = req.params;
    const currentUserId = req.userId;

    const chat = await Chat.findById(chatId)
      .populate({
        path: "participants",
        select: "username email avatar displayName bio isOnline lastSeen",
      })
      .populate({
        path: "privateLastChat",
        select: "text senderId createdAt readBy type fileUrl fileName",
        populate: {
          path: "senderId",
          select: "username avatar ",
        },
      })
      .populate({
        path: "groupLastMessage",
        select: "text senderId createdAt readBy type fileUrl fileName",
        populate: {
          path: "senderId",
          select: "username avatar ",
        },
      })
      .populate({
        path: "pinnedMessages",
        select: "text senderId createdAt type fileUrl fileName",
        populate: {
          path: "senderId",
          select: "username avatar",
        },
      });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const otherUser = chat.participants.find(
      (p) => p._id.toString() !== currentUserId,
    );

    res.status(200).json({
      chat,
      otherUser,
    });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getUserChatsController(req, res) {
  try {
    const userId = req.userId;
    const { search } = req.query;
    const chats = await getUserChats(userId, search);

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function addUserToGroupController(req, res) {
  try {
    const adderId = req.userId; // From auth middleware
    const { userId, chatId } = req.body;

    // Validate required fields
    if (!userId || !chatId) {
      return res.status(400).json({
        error: "userId and chatId are required",
      });
    }

    // Validate userId and chatId are valid ObjectIds
    // if (!mongoose.Types.ObjectId.isValid(userId) ||
    //     !mongoose.Types.ObjectId.isValid(chatId)) {
    //   return res.status(400).json({
    //     error: "Invalid userId or chatId format"
    //   });
    // }

    const result = await addUserToGroup(userId, chatId, adderId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Add user to group error:", error);
    res.status(400).json({
      error: error.message || "Failed to add user to group",
    });
  }
}

async function uploadFileController(req, res) {
  try {
    const file = req.file;
    const fileUrl = `/uploads/${file.filename}`;

    res.status(200).json({
      url: fileUrl,
      filename: file.filename,
      success: true,
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
async function getGroupInfo(req, res) {
  try {
    const { chatId } = req.params;
    const currentUserId = req.userId;

    const chat = await Chat.findById(chatId)
      .populate({
        path: "groupMembers",
        select: "username email avatar isOnline lastSeen",
      })
      .populate({
        path: "groupAdmins",
        select: "username email avatar isOnline lastSeen",
      });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.type !== "group") {
      return res.status(400).json({ message: "This is not a group chat" });
    }

    // Check if current user is a member of the group
    const isMember = chat.groupMembers.some(
      (member) => member._id.toString() === currentUserId,
    );

    if (!isMember) {
      return res
        .status(403)
        .json({
          message: "Access denied. You are not a member of this group.",
        });
    }

    const groupInfo = {
      _id: chat._id,
      name: chat.groupName,
      description: chat.groupDescription,
      avatar: chat.groupAvatar,
      members: chat.groupMembers,
      admins: chat.groupAdmins,
      memberCount: chat.groupMembers.length,
      createdAt: chat.createdAt,
    };

    res.status(200).json({ group: groupInfo });
  } catch (error) {
    console.error("Get group info error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function pinMessageController(req, res) {
  try {
    const { chatId, messageId, action } = req.body; // action: 'pin' or 'unpin'
    const userId = req.userId;

    if (!chatId || !messageId) {
      return res.status(400).json({ message: "chatId and messageId required" });
    }

    let result;
    if (action === "unpin") {
      result = await unpinMessage(chatId, messageId);
    } else {
      result = await pinMessage(chatId, messageId);
    }

    res.status(200).json({
      message: action === "unpin" ? "Message unpinned" : "Message pinned",
      pinnedMessages: result,
    });
  } catch (error) {
    console.error("Pin message error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to pin/unpin message" });
  }
}

async function updateGroupAdminController(req, res) {
  try {
    const actingUserId = req.userId;
    const { userId, chatId } = req.body;

    if (!userId || !chatId) {
      return res
        .status(400)
        .json({ message: "userId and chatId are required" });
    }

    const result = await addAdminToGroup(userId, chatId, actingUserId);

    res.status(200).json({
      message: "User promoted to group admin",
      admins: result.admins,
    });
  } catch (error) {
    console.error("Update group admin error:", error);
    res.status(400).json({
      message: error.message || "Failed to update group admins",
    });
  }
}

async function ticketWebhookController(req, res) {
  try {
    const {
      ticketId,
      title,
      clientName,
      clientContact,
      faultType,
      description,
      status,
      assignedEngineerName,
      assignedEngineerEmail,
      eventType,
    } = req.body || {};

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: "ticketId is required",
      });
    }

    const { chat, systemUserId } = await getOrCreateTicketsGroup();

    const existingTicket = await Ticket.findOne({ ticketId }).lean();
    const isNewTicket = !existingTicket;

    const now = new Date();
    const nextStatus = status || existingTicket?.status || "Open";

    const updatedTicket = await Ticket.findOneAndUpdate(
      { ticketId },
      {
        $set: {
          ticketId,
          title: title ?? existingTicket?.title ?? "",
          clientName: clientName ?? existingTicket?.clientName ?? "",
          clientContact: clientContact ?? existingTicket?.clientContact ?? "",
          faultType: faultType ?? existingTicket?.faultType ?? "",
          description: description ?? existingTicket?.description ?? "",
          status: nextStatus,
          assignedEngineerName:
            assignedEngineerName ?? existingTicket?.assignedEngineerName ?? "",
          assignedEngineerEmail:
            assignedEngineerEmail ?? existingTicket?.assignedEngineerEmail ?? "",
          chatId: chat._id,
          lastEventType:
            eventType || (isNewTicket ? "created" : "updated"),
          lastEventAt: now,
          lastPayload: req.body || null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const lines = [];
    lines.push(
      `🎫 Ticket ${isNewTicket ? "Created" : "Updated"}: ${ticketId}`,
    );
    lines.push(`Title: ${title ?? existingTicket?.title ?? ""}`.trim());

    if (clientName || existingTicket?.clientName) {
      lines.push(`Client: ${clientName ?? existingTicket?.clientName}`);
    }
    if (clientContact || existingTicket?.clientContact) {
      lines.push(
        `Client Contact: ${clientContact ?? existingTicket?.clientContact}`,
      );
    }
    if (faultType || existingTicket?.faultType) {
      lines.push(`Fault Type: ${faultType ?? existingTicket?.faultType}`);
    }

    if (existingTicket?.status && nextStatus !== existingTicket.status) {
      lines.push(`Status: ${existingTicket.status} → ${nextStatus}`);
    } else if (nextStatus) {
      lines.push(`Status: ${nextStatus}`);
    }

    const nextEngineerName =
      assignedEngineerName ?? existingTicket?.assignedEngineerName ?? "";
    const nextEngineerEmail =
      assignedEngineerEmail ?? existingTicket?.assignedEngineerEmail ?? "";
    if (nextEngineerName || nextEngineerEmail) {
      lines.push(
        `Assigned Engineer: ${[nextEngineerName, nextEngineerEmail]
          .filter(Boolean)
          .join(" • ")}`,
      );
    }

    if (description) {
      lines.push("");
      lines.push("Description:");
      lines.push(description);
    }

    const text =
      lines.join("\n") || "New ticket raised (no additional details provided).";

    const message = await Message.create({
      text,
      senderId: systemUserId,
      chatId: chat._id,
      type: "text",
      readBy: [systemUserId],
      createdAt: new Date(),
      ticketId,
      ticketEvent: isNewTicket ? "created" : "updated",
    });

    chat.groupMessages.push(message._id);
    chat.groupLastMessage = message._id;
    await chat.save();

    await Ticket.updateOne(
      { _id: updatedTicket._id },
      { $set: { lastMessageId: message._id } },
    );

    // Realtime broadcast to connected clients
    const io = req.app.get("io");
    if (io) {
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "username avatar email _id")
        .populate("readBy", "username avatar email _id");

      io.to(chat._id.toString()).emit("receive_message", {
        ...populatedMessage.toObject(),
        chatId: chat._id.toString(),
      });

      io.emit("chat_list_update", {
        chatId: chat._id.toString(),
        lastMessage: {
          text,
          senderId: systemUserId,
          timestamp: message.createdAt,
        },
      });
    }

    res.status(201).json({
      success: true,
      chatId: chat._id,
      messageId: message._id,
      ticket: {
        ticketId: updatedTicket.ticketId,
        status: updatedTicket.status,
        updatedAt: updatedTicket.updatedAt,
      },
    });
  } catch (error) {
    console.error("Ticket webhook error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record ticket in chat",
    });
  }
}

async function listTicketsController(req, res) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const skip = (page - 1) * limit;
    const { status, q } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (q) {
      const query = String(q);
      filter.$or = [
        { ticketId: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
        { clientName: { $regex: query, $options: "i" } },
        { faultType: { $regex: query, $options: "i" } },
      ];
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-lastPayload"),
      Ticket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("List tickets error:", error);
    res.status(500).json({ success: false, error: "Failed to list tickets" });
  }
}

async function getTicketController(req, res) {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ success: false, error: "Failed to get ticket" });
  }
}

async function getTicketMessagesController(req, res) {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId }).select("chatId ticketId");
    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }
    if (!ticket.chatId) {
      return res.status(400).json({
        success: false,
        error: "Ticket is not linked to a chat",
      });
    }

    const limit = parseInt(req.query.limit || "200", 10);
    const messages = await Message.find({
      chatId: ticket.chatId,
      ticketId: ticket.ticketId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("senderId", "username avatar email _id");

    res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        chatId: ticket.chatId,
        messages,
      },
    });
  } catch (error) {
    console.error("Get ticket messages error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get ticket messages" });
  }
}

module.exports = {
  createOrGetPrivateChat,
  getChatWithUser,
  getPrivateChatById,
  createGroupChat,
  getUserChatsController,
  addUserToGroupController,
  uploadFileController,
  getGroupInfo,
  pinMessageController,
  updateGroupAdminController,
  ticketWebhookController,
  listTicketsController,
  getTicketController,
  getTicketMessagesController,
};
