const express = require("express");
const router = express.Router();
const inventoryController = require("./inventory.controller");

router.get("/", inventoryController.getInventory);
router.patch("/:id/transfer", inventoryController.transferStock);
// router.get("/:id", inventoryController.getInventoryById);
// router.post("/", inventoryController.createOrUpdateInventory);
// router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;
