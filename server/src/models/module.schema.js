const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-_]+$/, "Invalid module key"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    href: {
      type: String,
      required: true,
      trim: true,
      match: [/^\/[a-z0-9-_/]*$/, "Invalid route"],
    },

    allowedDepartments: [
      {
        type: String,
        lowercase: true,
        trim: true,
        default: "all",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    ui: {
      icon: { type: String, default: "Box" },
      accent: { type: String, default: "#6c5fc7" },
      iconBg: { type: String, default: "#EEEDFE" },
      iconColor: { type: String, default: "#534AB7" },
      badgeBg: { type: String, default: "#DBEAFE" },
      badgeColor: { type: String, default: "#185FA5" },
    },

    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

moduleSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc?.isSystem) {
    throw new Error("System modules cannot be deleted");
  }
  next();
});

// ⚡ Performance index
moduleSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("Module", moduleSchema);
