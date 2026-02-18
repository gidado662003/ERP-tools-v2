const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },

    category: {
      type: String,
      enum: ["equipment", "consumable", "other"],
      default: "equipment",
    },

    unit: { type: String, default: "pcs" },

    status: {
      type: String,
      enum: ["draft", "awaiting_receipt", "received", "archived"],
      default: "draft",
    },

    trackIndividually: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
