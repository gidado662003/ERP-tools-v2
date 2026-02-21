const {
  getAssets,
  getAssetSummary,
  getAssetsByProduct,
  getAssetMovementsData,
  moveAsset,
  getAssetMovements,
} = require("../../../services/asset.service");

const assetController = {
  getAssets: async (req, res) => {
    try {
      const assets = await getAssets();
      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAssetSummary: async (req, res) => {
    try {
      const { search, location } = req.query;
      const summary = await getAssetSummary({ search, location });
      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAssetsByProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const { search } = req.query;
      const assets = await getAssetsByProduct(productId, search);
      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAssetMovementsDataController: async (req, res) => {
    try {
      const { assetId } = req.params;
      const { userSearch, supplierSearch } = req.query;
      const asset = await getAssetMovementsData(
        assetId,
        userSearch,
        supplierSearch,
      );
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.status(200).json(asset);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  moveAssetController: async (req, res) => {
    try {
      const movement = await moveAsset(req.body);
      res.status(200).json(movement);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAssetMovementsControllerById: async (req, res) => {
    try {
      const { assetId } = req.params;
      const movements = await getAssetMovements(assetId);
      res.status(200).json(movements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = assetController;
