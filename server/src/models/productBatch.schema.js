const mongoose = require("mongoose");

const procurementBatchSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    requisition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalRequisition",
    },

    expectedQuantity: {
      type: Number,
      required: true,
    },

    receivedQuantity: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["awaiting_receipt", "partially_received", "received"],
      default: "awaiting_receipt",
    },

    location: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProcurementBatch", procurementBatchSchema);
