const Supplier = require("../models/supplier.schema");

async function getSuppliers(search) {
  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const suppliers = await Supplier.find(query).lean();
    return suppliers;
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
