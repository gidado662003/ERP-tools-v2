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
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "documentCategory",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    requisitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalRequisition",
      default: null,
    },
    source: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1, department: 1, parent: 1 }, { unique: true });

module.exports = mongoose.model("documentCategory", categorySchema);
