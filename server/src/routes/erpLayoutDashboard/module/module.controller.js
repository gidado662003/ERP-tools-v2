const moduleService = require("./module.service");
const moduleController = {
  getModules: async (req, res) => {
    try {
      const user = req.authUser;
      const modules = await moduleService.getModules(user);
      res.status(200).json(modules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = moduleController;
