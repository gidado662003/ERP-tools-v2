const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["PROCUREMENT", "SALE", "TRANSFER", "ADJUSTMENT", "RETURN"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    previousQuantity: {
      type: Number,
      required: true,
    },

    newQuantity: {
      type: Number,
      required: true,
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },

    referenceModel: {
      type: String,
      enum: ["ProcurementBatch", "Requisition", "SalesOrder"],
    },

    location: String,

    performedBy: {
      name: String,
      email: String,
    },

    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
