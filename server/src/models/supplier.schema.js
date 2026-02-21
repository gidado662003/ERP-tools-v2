const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
    },
    productsSupplied: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", supplierSchema);
