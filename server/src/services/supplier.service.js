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

    const countMap = {};

    counts.forEach((c) => {
      countMap[c._id.toString()] = c.totalReceivedQuantity;
    });

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
    console.error("Error adding supplier:", error);
    throw error;
  }
}

async function getProductsBySupplier(supplierId) {
  try {
    const products = await ProductBatch.find({ supplier: supplierId })
      .populate("product", "name")
      .populate("requisition")
      .lean();
    return products.map((p) => ({
      productName: p.product.name,
      batchNumber: p.batchNumber,
      receivedQuantity: p.receivedQuantity,
      receivedDate: p.receivedDate,
      totalCost: p.requisition ? p.requisition.totalAmount : null,
      dateAdded: p.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching products by supplier:", error);
    throw error;
  }
}

module.exports = {
  getSuppliers,
  addSupplier,
  getProductsBySupplier,
};
