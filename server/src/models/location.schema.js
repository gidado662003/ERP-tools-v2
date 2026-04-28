const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["STORE", "CUSTOMER_SITE", "NOC", "POP", "VENDOR_SITE"],
      required: true,
      index: true,
    },
    defaultCategory: {
      type: String,
      enum: ["cpe", "noc", "pop", "other"],
      required: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Location", locationSchema);
