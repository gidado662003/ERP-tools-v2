const moduleService = require("./module.service");
const moduleController = {
  getModules: async (req, res) => {
    try {
      const user = req.authUser;

      const modules = await moduleService.getModules();
      res.status(200).json({ userName: user.name, modules });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createModule: async (req, res) => {
    try {
      const module = await moduleService.createModule(req.body);
      res.status(201).json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateModule: async (req, res) => {
    try {
      const module = await moduleService.updateModule(req.params.id, req.body);
      res.status(200).json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteModule: async (req, res) => {
    try {
      await moduleService.deleteModule(req.params.id);
      res.status(200).json({ message: "Module deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getModuleById: async (req, res) => {
    try {
      const module = await moduleService.getModuleById(req.params.id);
      res.status(200).json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = moduleController;
