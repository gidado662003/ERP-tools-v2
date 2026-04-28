const Category = require("../../../models/category.schema");
const categoryService = {
  getAllCategories: async (searchTerm) => {
    if (searchTerm) {
      return await Category.find({
        name: { $regex: searchTerm, $options: "i" },
      })
        .limit(5)
        .lean();
    }
    return await Category.find();
  },
  createCategory: async (data) => {
    const existingCategory = await Category.findOne({
      name: data.name.toLowerCase(),
    });
    if (existingCategory) {
      throw new Error("Category with this name already exists.");
    }
    const category = new Category(data);
    return await category.save();
  },
  updateCategory: async (id, data) => {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Category not found.");
    }
    if (data.name && data.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: data.name.toLowerCase(),
      });
      if (existingCategory) {
        throw new Error("Category with this name already exists.");
      }
    }
    Object.assign(category, data, { updatedAt: Date.now() });
    return await category.save();
  },
  deleteCategory: async (id) => {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Category not found.");
    }
    await category.remove();
  },
};

module.exports = categoryService;
