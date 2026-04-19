const express = require("express");
const router = express.Router();
const batchProductController = require("./batchProduct.controller");
router.get("/", batchProductController.getBatchProducts);
router.get("/:id", batchProductController.getBatchById);
router.post("/manual", batchProductController.createManualBatch);
router.post("/:id/recive", batchProductController.reciveProduct);
module.exports = router;
