const express = require("express");
const router = express.Router();
const {
  getMeetings,
  getMeetingById,
  createMeeting,
  getDashboardData,
  getActionItems,
  updateActionItemStatus,
} = require("./meetingApp.controller");

router.post("/create", createMeeting);
router.get("/list", getMeetings);
router.get("/list/:id", getMeetingById);
router.get("/dashboard", getDashboardData);
router.get("/actionItem/list", getActionItems);
router.patch("/actionItem/list/:id", updateActionItemStatus);

module.exports = router;
