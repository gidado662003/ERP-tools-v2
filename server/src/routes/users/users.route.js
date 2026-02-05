const express = require("express");
const {
  syncUserProfile,
  getAllusers,
  getUserById,
  isAuthenticated,
} = require("./users.controller");


const route = express.Router();

// Sync user profile with Laravel token (protected by Sanctum middleware)
route.post("/sync", syncUserProfile);

// Protected routes (authentication required)
route.get("/", getAllusers);
route.get("/:id", getUserById);

route.get("/is-authenticated", isAuthenticated);

module.exports = route;
