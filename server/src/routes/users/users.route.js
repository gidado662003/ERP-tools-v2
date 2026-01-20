const express = require("express");
const {
  createUser,
  getAllusers,
  getUserById,
  loginUser,
} = require("./users.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const route = express.Router();

// Public routes (no authentication required)
route.post("/signup", createUser);
route.post("/login", loginUser);

// Protected routes (authentication required)
route.get("/", authMiddleware, getAllusers);
route.get("/:id", authMiddleware, getUserById);

module.exports = route;
