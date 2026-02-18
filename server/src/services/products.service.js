const Product = require("../models/product.schema");

async function getProducts() {
  const products = await Product.find();
  return products;
}

module.exports = { getProducts };
