const express = require("express");
const router = express.Router();
const assetController = require("./asset.controller");

router.get("/", assetController.getAssets);
router.get("/summary", assetController.getAssetSummary);
router.get("/product/:productId", assetController.getAssetsByProduct);
router.get(
  "/movements/:assetId",
  assetController.getAssetMovementsDataController,
);
router.post("/movements", assetController.moveAssetController);
router.get(
  "/movements/history/:assetId",
  assetController.getAssetMovementsControllerById,
);
module.exports = router;
