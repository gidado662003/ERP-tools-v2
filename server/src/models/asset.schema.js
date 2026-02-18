const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  status: {
    type: String,
    enum: ["IN_STOCK", "ASSIGNED", "UNDER_MAINTENANCE", "RETIRED"],
    default: "IN_STOCK",
  },
  assignedTo: {
    name: String,
    email: String,
    department: String,
  },
  location: { type: String, default: "Main Warehouse" },
  serialNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// assetSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

module.exports = mongoose.model("Asset", assetSchema);
