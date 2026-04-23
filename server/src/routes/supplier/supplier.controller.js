const {
  addSupplier,
  getSuppliers,
  getProductsBySupplier,
} = require("../../services/supplier.service");
const supplierController = {
  addSupplierController: async (req, res) => {
    try {
      const newSupplier = await addSupplier(req.body);
      res.status(201).json({
        message: "Supplier added successfully",
        supplier: newSupplier,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to add supplier" });
    }
  },
  getSuppliersController: async (req, res) => {
    const { search } = req.query;
    try {
      const suppliers = await getSuppliers(search);

      res.status(200).json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  },
  getProductsBySupplierController: async (req, res) => {
    const { supplierId } = req.params;
    try {
      const products = await getProductsBySupplier(supplierId);

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products for supplier" });
    }
  },
};

module.exports = supplierController;
