const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    filesCount: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String },
    },
  },
  { timestamps: true },
);

categorySchema.index({ department: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
