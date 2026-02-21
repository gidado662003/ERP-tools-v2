const mongoose = require("mongoose");

const assetMovementSchema = new mongoose.Schema(
  {
    // Mongo-owned
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "ASSIGN",
        "RETURN",
        "TRANSFER",
        "RELOCATE",
        "MAINTENANCE_OUT",
        "MAINTENANCE_RETURN",
        "DISPOSE",
      ],
      required: true,
      index: true,
    },

    // -------- FROM --------
    fromStatus: String,

    fromHolderType: {
      type: String,
      enum: ["WAREHOUSE", "EMPLOYEE", "CUSTOMER", "VENDOR"],
    },

    fromHolderId: {
      type: String, // SQL ID or external ID
    },

    fromHolderSnapshot: {
      id: String,
      name: String,
      email: String,
    },

    fromLocation: String,

    // -------- TO --------
    toStatus: String,

    toHolderType: {
      type: String,
      enum: ["WAREHOUSE", "EMPLOYEE", "CUSTOMER", "VENDOR"],
    },

    toHolderId: {
      type: String, // SQL ID
    },

    toHolderSnapshot: {
      id: String,
      name: String,
      email: String,
    },

    toLocation: String,

    // -------- META --------
    reason: {
      type: String,
      trim: true,
    },

    // Who performed the action (also SQL user)
    performedById: {
      type: String, // SQL user ID
      required: true,
      index: true,
    },

    performedBySnapshot: {
      id: String,
      name: String,
      email: String,
    },

    performedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssetMovement", assetMovementSchema);
