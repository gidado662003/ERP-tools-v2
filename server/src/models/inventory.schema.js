const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },
  category: {
    type: String,
    enum: ["equipment", "consumable", "other"],
    default: "equipment",
  },
  quantity: { type: Number, default: 0, min: 0 },
  location: { type: String, default: "Main Warehouse" },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inventory", inventorySchema);
