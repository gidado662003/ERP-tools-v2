const Supplier = require("../models/supplier.schema");
const ProductBatch = require("../models/productBatch.schema");

async function getSuppliers(search) {
  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const suppliers = await Supplier.find(query).lean();
    const supplierIds = suppliers.map((s) => s._id);

    const counts = await ProductBatch.aggregate([
      {
        $match: {
          supplier: { $in: supplierIds },
        },
      },
      {
        $group: {
          _id: "$supplier",
          totalReceivedQuantity: { $sum: "$receivedQuantity" },
        },
      },
    ]);
    console.log("🚀 ~ getSuppliers ~ counts:", counts);

    const countMap = {};

    counts.forEach((c) => {
      countMap[c._id.toString()] = c.totalReceivedQuantity;
    });
    console.log("🚀 ~ getSuppliers ~ countMap:", countMap);

    const suppliersWithCount = suppliers.map((supplier) => ({
      ...supplier,
      itemsSupplied: countMap[supplier._id.toString()] || 0,
    }));

    return suppliersWithCount;
  } catch (error) {
    throw error;
  }
}

async function addSupplier(supplierData) {
  try {
    const newSupplier = new Supplier(supplierData);
    await newSupplier.save();
    return newSupplier;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getSuppliers,
  addSupplier,
};
