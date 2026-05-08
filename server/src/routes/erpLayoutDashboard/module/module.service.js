const { formatDistanceToNow } = require("date-fns");
const Module = require("../../../models/module.schema");
const InternalRequisition = require("../../../models/internal-requsitions-schema");
const Meeting = require("../../../models/meeting.schema");
const Document = require("../../../models/internal-documents.schema");
const Supplier = require("../../../models/supplier.schema");
const ActionItem = require("../../../models/meetingActionItems.schema");
const Chats = require("../../../models/chat.schema");
const Message = require("../../../models/message.schema");
const mongoose = require("mongoose");
const moduleService = {
  getModules: async (user) => {
    const {
      id: userId,
      department: { name: department },
      name,
    } = user;
    const [
      modules,
      requisition,
      meeting,
      document,
      supplier,
      actionItem,
      unreadMessages,

      requisitionCount,
      meetingCount,
      documentCount,
      supplierCount,
      pendingActionItems,
    ] = await Promise.all([
      Module.find({ isActive: true }).lean(),

      InternalRequisition.findOne({ department })
        .select("title createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      Meeting.findOne({ department })
        .select("title createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      Document.findOne({ department })
        .select("title createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      Supplier.findOne()
        .select("title createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      ActionItem.findOne({ department })
        .select("desc createdAt status penalty completedAt")
        .sort({ createdAt: -1 })
        .lean(),

      Message.aggregate([
        {
          $lookup: {
            from: "chats",
            localField: "chatId",
            foreignField: "_id",
            as: "chat",
          },
        },

        {
          $unwind: "$chat",
        },

        {
          $match: {
            "chat.participants": userId,

            senderId: {
              $ne: new mongoose.Types.ObjectId(userId),
            },

            readBy: {
              $ne: new mongoose.Types.ObjectId(userId),
            },
          },
        },

        {
          $count: "total",
        },
      ]),

      InternalRequisition.countDocuments({ department }),

      Meeting.countDocuments({ department }),

      Document.countDocuments({ department }),

      Supplier.countDocuments({ department }),

      ActionItem.countDocuments({
        status: { $ne: "completed" },
        department,
      }),
    ]);

    const activity = [
      requisition && {
        type: "requisition",
        text: "New requisition submitted",
        label: requisition.title,
        createdAt: requisition.createdAt,
      },

      meeting && {
        type: "meeting",
        text: "Meeting minutes uploaded",
        label: meeting.title,
        createdAt: meeting.createdAt,
      },

      document && {
        type: "document",
        text: "Document added",
        label: document.title,
        createdAt: document.createdAt,
      },

      supplier && {
        type: "supplier",
        text: "Supplier updated",
        label: supplier.title,
        createdAt: supplier.createdAt,
      },

      actionItem && {
        type: "action-item",
        text:
          actionItem.status === "completed"
            ? "Action item completed"
            : "Action item pending",

        label: actionItem.desc,
        createdAt: actionItem.createdAt,
      },
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((item) => ({
        ...item,

        time: formatDistanceToNow(new Date(item.createdAt), {
          addSuffix: true,
        }),
      }));

    const alerts = [];

    if (actionItem && actionItem.status !== "completed") {
      alerts.push({
        type: "warning",
        text: "Pending action item",
        label: actionItem.desc,
      });
    }
    const unreadMessagesClean =
      unreadMessages.length > 0 ? unreadMessages[0].total : 0;

    const stats = {
      unreadMessages: unreadMessagesClean,
      requisitions: requisitionCount,
      meetings: meetingCount,
      documents: documentCount,
      suppliers: supplierCount,
      pendingActionItems,
    };

    return {
      userName: name,
      modules,
      activity,
      alerts,
      stats,
    };
  },
};

module.exports = moduleService;
