const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },

    // Snapshot fields (current state)
    title: { type: String, default: "" },
    clientName: { type: String, default: "" },
    clientContact: { type: String, default: "" },
    faultType: { type: String, default: "" },
    description: { type: String, default: "" },

    status: { type: String, default: "Open", index: true },
    assignedEngineerName: { type: String, default: "" },
    assignedEngineerEmail: { type: String, default: "" },

    // Links
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },

    // Metadata
    lastEventType: { type: String, default: "created" },
    lastEventAt: { type: Date, default: Date.now, index: true },
    lastPayload: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

ticketSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Ticket", ticketSchema);

