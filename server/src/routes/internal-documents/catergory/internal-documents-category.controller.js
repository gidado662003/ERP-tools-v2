const {
  getCategories,
  createCategory,
  renameCategory,
  deleteCategory,
} = require("../../../services/documents.service");
const category = {
  getCategoriesController: async (req, res) => {
    try {
      const user = req.user;
      const categories = await getCategories(user, req.query);
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error in getCategoriesController:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  createCategoryController: async (req, res) => {
    try {
      const user = req.user;
      const department = user.department.name;
      const parentcategory = req.body.parentCategoryId ?? null;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }
      const newCategory = await createCategory({
        name: name,
        department: department,
        parent: parentcategory,
        createdBy: {
          id: user.id.toString(),
          name: user.displayName || user.name,
          email: user.email,
          department: user.department.name,
        },
      });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error in createCategoryController:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  renameCategoryController: async (req, res) => {
    try {
      const payload = {
        name: req.body.name,
        id: req.params.id,
      };
      const categoryChange = await renameCategory(payload);
      res.status(200).json(categoryChange);
    } catch (error) {
      console.error("Error in renameCategoryController:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  deleteCategoryController: async (req, res) => {
    try {
      const payload = {
        id: req.params.id,
        deleted: true,
      };
      const categoryChange = await deleteCategory(payload);
      res.status(200).json(categoryChange);
    } catch (error) {
      console.error("Error in renameCategoryController:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  recoverCategoryController: async (req, res) => {
    try {
      const payload = {
        id: req.params.id,
        deleted: false,
      };
      const categoryChange = await deleteCategory(payload);
      res.status(200).json(categoryChange);
    } catch (error) {
      console.error("Error in renameCategoryController:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  getDeleteCategoryController: async (req, res) => {
    try {
      const user = req.user;
      const categories = await getCategories(user, req.query, {
        includeDeleted: true,
      });
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error in getCategoriesController:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
module.exports = {
  category,
};
