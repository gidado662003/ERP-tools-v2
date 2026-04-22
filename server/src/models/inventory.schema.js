const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  category: {
    type: String,
    enum: ["pop", "cpe", "noc"],
    default: "equipment",
  },
  quantity: { type: Number, default: 0, min: 0 },
  location: { type: String, default: "Main Warehouse" },
  lastUpdated: { type: Date, default: Date.now },
});
inventorySchema.index({ product: 1, location: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);
