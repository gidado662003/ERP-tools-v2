const express = require("express");
const productController = require("./products.controller");
const router = express.Router();

router.get("/", productController.getProducts);

module.exports = router;
