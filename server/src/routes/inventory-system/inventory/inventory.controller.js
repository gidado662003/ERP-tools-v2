const {
  getInventory,
  transferStock,
} = require("../../../services/inventory.service");
const inventoryController = {
  getInventory: async (req, res) => {
    try {
      const inventory = await getInventory();
      res
        .status(200)
        .json({ message: "Inventory retrieved successfully", data: inventory });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving inventory", error });
    }
  },
  transferStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { toLocation } = req.body;
      const transferredStock = await transferStock({
        id,
        toLocation,
      });
      res.status(200).json({
        message: "Stock transferred successfully",
        data: transferredStock,
      });
    } catch (error) {
      res.status(500).json({ message: "Error transferring stock", error });
    }
  },
};

module.exports = inventoryController;
