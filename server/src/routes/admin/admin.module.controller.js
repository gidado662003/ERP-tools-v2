const adminModuleService = require("./admin.module.service");

const moduleController = {
  getModulesAdmin: async (req, res) => {
    try {
      const modules = await adminModuleService.getModulesAdmin();
      res.status(200).json({ userName: "admin", modules });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  },
  createModuleAdmin: async (req, res) => {
    try {
      const module = await adminModuleService.createModuleAdmin(req.body);
      res.status(201).json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateModuleAdmin: async (req, res) => {
    try {
      const module = await adminModuleService.updateModuleAdmin(
        req.params.id,
        req.body,
      );
      res.status(200).json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteModuleAdmin: async (req, res) => {
    try {
      await adminModuleService.deleteModuleAdmin(req.params.id);
      res.status(200).json({ message: "Module deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getModuleByIdAdmin: async (req, res) => {
    try {
      const module = await adminModuleService.getModuleByIdAdmin(req.params.id);
      res.status(200).json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = moduleController;
