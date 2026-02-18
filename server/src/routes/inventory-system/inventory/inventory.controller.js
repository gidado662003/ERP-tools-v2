const { getInventory } = require("../../../services/inventory.service");
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
};

module.exports = inventoryController;
