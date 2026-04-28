const Asset = require("../models/asset.schema");
const AssetMovement = require("../models/assetMovementSchema");
const User = require("../models/user.schema");
const Supplier = require("../models/supplier.schema");
const Location = require("../models/location.schema");
const mongoose = require("mongoose");
async function getAssets() {
  const assets = await Asset.find().populate("product");
  return assets;
}

async function getAssetSummary({ search, location }) {
  const pipeline = [];

  const matchStage = {};

  if (location) {
    matchStage.location = location;
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push(
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  );

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "product.name": { $regex: search, $options: "i" } },
          { "product.category": { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $group: {
      _id: "$product._id",

      productName: { $first: "$product.name" },
      category: { $first: "$product.category" },

      total: { $sum: 1 },

      inStock: {
        $sum: {
          $cond: [{ $eq: ["$status", "IN_STOCK"] }, 1, 0],
        },
      },

      assigned: {
        $sum: {
          $cond: [{ $eq: ["$status", "ASSIGNED"] }, 1, 0],
        },
      },

      underMaintenance: {
        $sum: {
          $cond: [{ $eq: ["$status", "UNDER_MAINTENANCE"] }, 1, 0],
        },
      },

      retired: {
        $sum: {
          $cond: [{ $eq: ["$status", "RETIRED"] }, 1, 0],
        },
      },

      locations: {
        $addToSet: "$location",
      },
    },
  });

  pipeline.push(
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: 1,
        category: 1,
        total: 1,
        inStock: 1,
        assigned: 1,
        underMaintenance: 1,
        retired: 1,
        locations: 1,
      },
    },
    { $sort: { total: -1 } },
  );

  return Asset.aggregate(pipeline);
}

async function getAssetsByProduct(productId, search) {
  const query = { product: productId };

  if (search) {
    query.$or = [
      { serialNumber: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { "assignedTo.name": { $regex: search, $options: "i" } },
      { "assignedTo.email": { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
    ];
  }

  return Asset.find(query)
    .populate("product")
    .populate({
      path: "movements",
      options: { sort: { performedAt: -1 }, limit: 1 },
      select: "toHolderSnapshot fromHolderSnapshot performedAt type",
    })
    .sort({ createdAt: -1 });
}

async function getAssetMovementsData(assetId, userSearch, supplierSearch) {
  const userFilter = userSearch
    ? {
        $or: [
          { username: { $regex: userSearch, $options: "i" } },
          { email: { $regex: userSearch, $options: "i" } },
        ],
      }
    : {};

  const supplierFilter = supplierSearch
    ? {
        $or: [
          { name: { $regex: supplierSearch, $options: "i" } },
          { "contactInfo.email": { $regex: supplierSearch, $options: "i" } },
        ],
      }
    : {};

  const [asset, users, vendors, locations] = await Promise.all([
    Asset.findById(assetId).populate("product"),
    User.find(userFilter).select("displayName email _id").limit(2).lean(),
    Supplier.find(supplierFilter)
      .select("name contactInfo _id")
      .limit(10)
      .lean(),
    Location.find({ isActive: true })
      .select("name type defaultCategory address")
      .sort({ name: 1 })
      .lean(),
  ]);

  return { asset, users, vendors, locations };
}

async function moveAsset(movementData,user) {
  console.log(user);
  const asset = await Asset.findById(movementData.asset);

  if (!asset) {
    throw new Error("Asset not found");
  }

  const movementPayload = {
    ...movementData,
    performedById: user.id??user._id,
    performedBySnapshot: {
      id: user.id??user._id,
      name: user.displayName??user.name,
      email: user.email??user.username,
    },
    fromStatus: asset.status,
    fromHolderType: asset.holderType,
    fromHolderId: asset.holderId,
    fromLocation: asset.location,

    fromHolderSnapshot: asset.holderSnapshot ?? null,
  };


  const movement = await AssetMovement.create(movementPayload);

  const update = {
    $push: { movements: movement._id },
  };

  const setFields = {};
  let resolvedCategory = null;

  if (movementData.toLocation) {
    setFields.location = movementData.toLocation;
  }

  if (movementData.toLocationId) {
    const destinationLocation = await Location.findOne({
      _id: movementData.toLocationId,
      isActive: true,
    }).lean();

    if (!destinationLocation) {
      throw new Error("Destination location is invalid or inactive");
    }

    setFields.locationRef = destinationLocation._id;
    setFields.location = destinationLocation.name;
    resolvedCategory = destinationLocation.defaultCategory;
  }

  if (movementData.toStatus) {
    setFields.status = movementData.toStatus;
  }

  if (movementData.toHolderType) {
    setFields.holderType = movementData.toHolderType;
  }

  if (movementData.toHolderId && mongoose.Types.ObjectId.isValid(movementData.toHolderId)) {
    setFields.holder = movementData.toHolderId;
  }

  if (!resolvedCategory && movementData.toHolderType === "CUSTOMER") {
    resolvedCategory = "cpe";
  }

  if (resolvedCategory) {
    setFields.category = resolvedCategory;
  }

  if (Object.keys(setFields).length > 0) {
    update.$set = setFields;
  }

  const updatedAsset = await Asset.findByIdAndUpdate(
    movementData.asset,
    update,
    {
      new: true,
    },
  );

  if (!updatedAsset) {
    throw new Error("Asset not found");
  }
  return movement;
}

async function getAssetMovements(assetId) {
  const movements = await AssetMovement.find({ asset: assetId }).sort({
    createdAt: -1,
  });
  return movements;
}

module.exports = {
  getAssets,
  getAssetSummary,
  getAssetsByProduct,
  getAssetMovementsData,
  moveAsset,
  getAssetMovements,
};
