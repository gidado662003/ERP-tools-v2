const express = require("express");
const {
  syncUserProfile,
  getAllusers,
  getUserById,
  isAuthenticated,
  getDepartments,
} = require("./users.controller");

const route = express.Router();

// Sync user profile with Laravel token (protected by Sanctum middleware)
route.post("/sync", syncUserProfile);

// Protected routes (authentication required)
route.get("/", getAllusers);
route.get("/departments", getDepartments);
route.get("/is-authenticated", isAuthenticated);
route.get("/:id", getUserById);

module.exports = route;
