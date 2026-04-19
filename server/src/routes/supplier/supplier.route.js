const express = require("express");
const router = express.Router();

const supplierController = require("./supplier.controller");

router.get("/", supplierController.getSuppliersController);
router.post("/", supplierController.addSupplierController);
router.get(
  "/:supplierId/products",
  supplierController.getProductsBySupplierController,
);

module.exports = router;
