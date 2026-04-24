const {
  getProducts,
  getProductByName,
} = require("../../../services/products.service");
const productController = {
  getProducts: async (req, res) => {
    try {
      const products = await getProducts(req.query);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getProductByName: async (req, res) => {
    try {
      const { name } = req.query;
      console.log("🚀 ~ name:", req.query);
      if (!name) {
        return res
          .status(400)
          .json({ error: "Name query parameter is required" });
      }
      const product = await getProductByName(name);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = productController;
