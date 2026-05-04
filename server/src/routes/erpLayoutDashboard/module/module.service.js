const Module = require("../../../models/module.schema");

const moduleService = {
  getModules: async () => {
    const modules = await Module.find();
    return modules;
  },
  createModule: async (data) => {
    const existingModule = await Module.findOne({ name: data.name });
    if (existingModule) {
      throw new Error("Module with this name already exists.");
    }

    const module = await Module.create(data);
    return module;
  },
  updateModule: async (id, data) => {
    const module = await Module.findByIdAndUpdate(id, data, { new: true });
    return module;
  },
  deleteModule: async (id) => {
    await Module.findByIdAndDelete(id);
  },
  getModuleById: async (id) => {
    const module = await Module.findById(id);
    return module;
  },
};

module.exports = moduleService;
