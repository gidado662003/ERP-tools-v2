const categoryService = require("./category.service");
const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createCategory: async (req, res) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body,
      );
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = categoryController;
