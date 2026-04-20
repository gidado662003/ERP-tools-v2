const {
  getBatchProducts,
  getBatchById,
  getBatchProduct,
  createManualProcurementBatch,
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
  getBatchById: async (req, res) => {
    try {
      const batch = await getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }
      res.status(200).json(batch);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  reciveProduct: async (req, res) => {
    try {
      console.log("body", req.body);
      const { quantity, category, assetMetas, performedBy } = req.body;
      console.log("🚀 ~ category:", category);
      const batchProduct = await getBatchProduct(
        req.params.id,
        quantity,
        category,
        assetMetas ?? [],
        performedBy ||
          (req.user && { name: req.user.name, email: req.user.email }),
      );
      res.status(200).json(batchProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createManualBatch: async (req, res) => {
    try {
      const batch = await createManualProcurementBatch(req.body, req.user);
      res.status(201).json(batch);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = batchProductController;
