const Product = require("../models/product.schema");

async function getProducts(query) {
  const filter = {};
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  const products = await Product.find(filter).limit(10);
  return products;
}

async function getProductByName(name) {
  const product = await Product.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  return product;
}

module.exports = { getProducts, getProductByName };
