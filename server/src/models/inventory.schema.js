const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  quantity: { type: Number, default: 0, min: 0 },
  location: { type: String, default: "Main Warehouse" },
  lastUpdated: { type: Date, default: Date.now },
});

// inventorySchema.pre("save", function (next) {
//   this.lastUpdated = Date.now();
//   next();
// });

module.exports = mongoose.model("Inventory", inventorySchema);
