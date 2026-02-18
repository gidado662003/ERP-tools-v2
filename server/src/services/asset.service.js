const Asset = require("../models/asset.schema");
async function getAssets() {
  const assets = await Asset.find().populate("product");
  return assets;
}

module.exports = { getAssets };
