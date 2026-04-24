const express = require("express");
const productController = require("./products.controller");
const router = express.Router();

router.get("/", productController.getProducts);
router.get("/name", productController.getProductByName);
module.exports = router;
