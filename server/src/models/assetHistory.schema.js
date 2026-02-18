const mongoose = require("mongoose");

const assetHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "ASSIGNED",
        "RETURNED",
        "MAINTENANCE_STARTED",
        "MAINTENANCE_COMPLETED",
        "RETIRED",
        "LOCATION_CHANGED",
      ],
      required: true,
    },

    previousStatus: String,
    newStatus: String,

    previousLocation: String,
    newLocation: String,

    assignedTo: {
      name: String,
      email: String,
      department: String,
    },

    performedBy: {
      name: String,
      email: String,
    },

    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssetHistory", assetHistorySchema);
