// models/User.js
const mongoose = require("mongoose");

// Add to your User schema or create Chat schema

const userSchema = new mongoose.Schema({
  // Basic Info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  // Profile
  displayName: {
    type: String,
    trim: true,
    maxlength: 50,
  },

  avatar: {
    type: String, // URL to profile picture
    default: null,
  },

  bio: {
    type: String,
    maxlength: 200,
    default: "",
  },

  // Status & Activity
  isOnline: {
    type: Boolean,
    default: false,
  },

  lastSeen: {
    type: Date,
    default: Date.now,
  },

  socketId: {
    type: String,
    default: null, // For Socket.IO connection tracking
  },

  // Chat-related
  joinedRooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],

  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // Account Management
  isVerified: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user",
  },
});

// Index for performance
userSchema.index({ isOnline: 1 });

module.exports = mongoose.model("User", userSchema);
