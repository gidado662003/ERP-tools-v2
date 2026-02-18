const express = require("express");
const router = express.Router();
const assetController = require("./asset.controller");

router.get("/", assetController.getAssets);

module.exports = router;
