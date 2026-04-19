const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    contactInfo: {
      email: { type: String, lowercase: true, trim: true },
      phone: String,
      address: String,
    },
  },
  { timestamps: true },
);

supplierSchema.pre("save", async function () {
  if (this.isModified("name")) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);
