const {
  addSupplier,
  getSuppliers,
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
};

module.exports = supplierController;
