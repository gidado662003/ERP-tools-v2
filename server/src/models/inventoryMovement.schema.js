const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
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

    fromLocation: String,
    toLocation: String,
    adjustmentReason: {
      type: String,
      enum: ["DAMAGED", "LOST", "COUNT_CORRECTION", "EXPIRED", "OTHER"],
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["ProcurementBatch", "Requisition", "StockTransfer"],
    },

    performedBy: {
      name: String,
      email: String,
    },

    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);

// {
//   product: "cable_product_id",
//   inventory: "cable_inventory_id",   // the Ajah or Ikeja stock record
//   type: "SALE",                       // or you could rename this to "DISPATCH" — more ISP-accurate
//   quantity: -200,                     // negative = reduction
//   previousQuantity: 400,
//   newQuantity: 200,
//   reference: "requisition_id",        // the job/requisition that consumed it
//   referenceModel: "Requisition",
//   performedBy: { name: "Emeka", email: "emeka@syscodes.com" },
//   notes: "Installation at customer site - Lagos Island",
// }
