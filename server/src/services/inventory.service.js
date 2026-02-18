const Product = require("../models/product.schema");
const Inventory = require("../models/inventory.schema");
const Asset = require("../models/asset.schema");
const ProcurementBatch = require("../models/productBatch.schema");

async function createProductsFromRequest(request) {
  console.log("Creating products from request:", request._id);
  for (const item of request.items) {
    let product = await Product.findOne({
      name: item.description.trim().toLowerCase(),
    });

    if (!product) {
      product = await Product.create({
        name: item.description.trim().toLowerCase(),
        unit: item.unit || "pcs",
        trackIndividually: item.type === "asset",
      });
    }

    const batch = await ProcurementBatch.create({
      product: product._id,
      requisition: request._id,
      expectedQuantity: item.quantity,
      status: "awaiting_receipt",
      location: request.location,
    });
    await batch.save();

    // 2️⃣ If Asset
    // if (item.type === "asset") {
    //   for (let i = 0; i < item.quantity; i++) {
    //     await Asset.create({
    //       product: product._id,
    //       status: "IN_STOCK",
    //       location: request.location,
    //       serialNumber: item.serialNumbers[i],
    //     });
    //   }
    // }

    // 3️⃣ If Inventory
    // if (item.type === "inventory") {
    //   await Inventory.findOneAndUpdate(
    //     { product: product._id },
    //     {
    //       $inc: { quantity: item.quantity },
    //       $set: { location: request.location },
    //     },
    //     { upsert: true },
    //   );
    // }
  }
}

async function getBatchProduct(id, quantity) {
  const batch = await ProcurementBatch.findById(id).populate("product");
  console.log(batch);
  if (!batch) {
    throw new Error("Batch product not found");
  }
  batch.receivedQuantity += quantity;

  if (batch.receivedQuantity >= batch.expectedQuantity) {
    batch.status = "received";
  } else {
    batch.status = "partially_received";
  }

  await batch.save();

  if (!batch.product.trackIndividually) {
    await Inventory.findOneAndUpdate(
      { product: batch.product._id },
      {
        $inc: { quantity: quantity },
        $set: { location: batch.location },
      },
      { upsert: true },
    );
  }

  if (batch.product.trackIndividually) {
    for (let i = 0; i < quantity; i++) {
      await Asset.create({
        product: batch.product._id,
        status: "IN_STOCK",
        location: batch.location,
      });
    }
  }

  return batch;
}

async function getInventory() {
  const inventory = await Inventory.find().populate("product");
  return inventory;
}

async function getAssets() {
  const assets = await Asset.find().populate("product");
  return assets;
}

module.exports = {
  getBatchProduct,
  createProductsFromRequest,
  getInventory,
  getAssets,
};
