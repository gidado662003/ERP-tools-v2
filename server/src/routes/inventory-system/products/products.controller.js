const { getProducts } = require("../../../services/products.service");
const productController = {
  getProducts: async (req, res) => {
    try {
      const products = await getProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = productController;
