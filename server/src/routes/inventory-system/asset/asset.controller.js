const { getAssets } = require("../../../services/asset.service");

const assetController = {
  getAssets: async (req, res) => {
    try {
      const assets = await getAssets();
      res.status(200).json(assets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = assetController;
