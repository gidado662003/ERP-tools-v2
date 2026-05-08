const express = require("express");
const moduleController = require("./module.controller");
const router = express.Router();

router.get("/", moduleController.getModules);

module.exports = router;
