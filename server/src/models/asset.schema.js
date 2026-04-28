const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementBatch",
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["cpe", "noc", "pop", "store", "other"],
      default: "cpe",
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    status: {
      type: String,
      enum: [
        "IN_STOCK",
        "ASSIGNED",
        "UNDER_MAINTENANCE",
        "RETIRED",
        "RETURNED",
      ],
      default: "IN_STOCK",
      index: true,
    },

    condition: {
      type: String,
      enum: ["NEW", "GOOD", "FAIR", "DAMAGED"],
      default: "NEW",
    },

    purchaseDate: Date,

    ownership: {
      type: String,
      enum: ["COMPANY", "CUSTOMER"],
      default: "COMPANY",
    },

    holderType: {
      type: String,
      enum: ["STORE", "EMPLOYEE", "CUSTOMER", "VENDOR"],
    },

    holder: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "holderType",
    },

    movements: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AssetMovement",
        },
      ],
      default: [],
    },

    location: {
      type: String,
      default: "Main Warehouse",
      index: true,
    },
    locationRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      index: true,
    },

    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Asset", assetSchema);
