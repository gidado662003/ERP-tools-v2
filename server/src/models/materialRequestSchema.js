const mongoose = require("mongoose");

const materialRequestItemSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const materialRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
    },

    requestedBy: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },

    items: {
      type: [materialRequestItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one item is required",
      },
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "DISPATCHED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    approvedBy: {
      name: String,
      email: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    approvedAt: Date,

    dispatchedAt: Date,

    rejectedBy: {
      name: String,
      email: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("MaterialRequest", materialRequestSchema);
