const {
  getBatchProducts,
  getBatchProduct,
} = require("../../../services/inventory.service");
const batchProductController = {
  getBatchProducts: async (req, res) => {
    try {
      const batchProducts = await getBatchProducts();
      res.status(200).json(batchProducts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getBatchProduct: async (req, res) => {
    try {
      const { quantity, serialNumbers } = req.body;
      const batchProduct = await getBatchProduct(
        req.params.id,
        quantity,
        serialNumbers,
      );
      res.status(200).json(batchProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = batchProductController;
