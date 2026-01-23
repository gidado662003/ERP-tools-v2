require("dotenv").config();
const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Chat = require("../src/models/chat.schema");
const Message = require("../src/models/message.schema");

const server = http.createServer(app);

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN, // Allow configured origins
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Join a specific chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // typing
  socket.on("typing", ({ chatId, user }) => {
    // Send to everyone EXCEPT sender
    socket.to(chatId).emit("user_typing", {
      chatId,
      user,
    });
  })

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("user_stop_typing", {
      chatId,
      userId,
    });
  });

  // Leave a specific chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat: ${chatId}`);
  });

  // update pin message
  socket.on("update_pin", async ({ chatId, messageId, action }) => {
    try {
      // Emit to all users in the chat room
      io.to(chatId).emit("pin_updated", {
        chatId,
        messageId,
        action,
        timestamp: new Date()
      });

      console.log(`Message ${messageId} ${action}ned in chat ${chatId}`);
    } catch (error) {
      console.error("Pin update error:", error);
      socket.emit("error", { message: "Failed to update pin status" });
    }
  });

  // mark as read
  socket.on("mark_as_read", async ({ chatId, userId }) => {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const chatObjectId = new mongoose.Types.ObjectId(chatId);

      const result = await Message.updateMany(
        {
          chatId: chatObjectId,
          readBy: { $ne: userObjectId }, // not already read
        },
        {
          $addToSet: { readBy: userObjectId }, // prevent duplicates
        }
      );
      console.log(result)
      // Only notify others if something actually changed
      console.log("egg")
      if (result.modifiedCount > 0) {
        socket.to(chatId).emit("messages_read", {
          chatId,
          userId,
        });
      }
    } catch (err) {
      console.error("mark_as_read error:", err);
    }
  });


  // Send message to specific chat room
  socket.on("send_message", async (data) => {
    const messageData = {
      text: data.text,
      senderId: data.senderId,
      chatId: data.chatId,
      createdAt: data.timestamp || new Date().toISOString(),
      readBy: [data.senderId],
      type: data.type,
      fileUrl: data.fileUrl,
    };

    const newMessage = await Message.create(messageData);

    // Only update chat document for private/group chats (not global chat)
    if (data.chatId) {
      const chat = await Chat.findById(data.chatId);
      if (!chat) {
        console.error("Chat not found:", data.chatId);
        return;
      }

      if (chat.type === "group") {
        chat.groupMessages.push(newMessage._id);
        chat.groupLastMessage = newMessage._id;
      } else {
        chat.privateChat.push(newMessage._id);
        chat.privateLastChat = newMessage._id;
      }
      await chat.save();

      // Populate sender info before broadcasting
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'username avatar')
        .populate('readBy', 'username avatar');

      // Send to specific room
      io.to(data.chatId).emit("receive_message", {
        ...populatedMessage.toObject(),
        chatId: data.chatId
      });

      io.emit("chat_list_update", {
        chatId: data.chatId,
        lastMessage: {
          text: messageData.text,
          senderId: messageData.senderId,
          timestamp: messageData.createdAt,
        },
      });

    } else {
      // Broadcast to all connected clients for global chat
      io.emit("receive_message", messageData);
    }
  });



  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

async function startServer() {
  await mongoose.connect(MONGODB_URI);
  server.listen(PORT, () => {
    console.log(`server started on port ${PORT} in ${NODE_ENV} mode`);
  });
}
startServer();
