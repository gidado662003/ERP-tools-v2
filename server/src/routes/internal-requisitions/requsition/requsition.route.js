const express = require("express");
const router = express.Router();
const { getAllDataFigures, getAllData, getDataById } = require("./requsition.controller");

router.get("/list", getAllDataFigures)
router.get("/allrequest", getAllData)
router.get("/allrequest/:id", getDataById)

module.exports = router;
