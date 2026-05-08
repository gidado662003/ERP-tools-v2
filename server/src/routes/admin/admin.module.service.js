const Module = require("../../models/module.schema");

const adminModuleService = {
  getModulesAdmin: async () => {
    const modules = await Module.find();
    return modules;
  },
  createModuleAdmin: async (data) => {
    const existingModule = await Module.findOne({ name: data.name });
    if (existingModule) {
      throw new Error("Module with this name already exists.");
    }
    if (data.allowedDepartments && !Array.isArray(data.allowedDepartments)) {
      data.allowedDepartments = [data.allowedDepartments];
    }
    if (data.allowedDepartments && data.allowedDepartments.length === 0) {
      data.allowedDepartments = ["all"];
    }

    const module = await Module.create(data);
    return module;
  },
  updateModuleAdmin: async (key, data) => {
    const module = await Module.findOneAndUpdate({ key }, data, { new: true });
    return module;
  },
  deleteModuleAdmin: async (id) => {
    await Module.findByIdAndDelete(id);
  },
  getModuleByIdAdmin: async (id) => {
    const module = await Module.findById(id);
    return module;
  },
};

module.exports = adminModuleService;
