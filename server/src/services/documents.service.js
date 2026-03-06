const Document = require("../models/internal-documents.schema");
const Category = require("../models/internal-documents-category.schema");
const User = require("../models/user.schema");

const getDocumentsData = async (user) => {
  try {
    const department = user.department;
    const categories = await Category.find({ department }).lean();
    const categoryIds = categories.map((cat) => cat._id);
    const documents = await Document.find({
      department,
      category: { $in: categoryIds },
    })
      .populate("category", "name slug")
      .populate("uploadedBy", "displayName email")
      .lean();

    return {
      categories,
      documents,
    };
  } catch (error) {
    console.error("Error in getDocumentsData:", error);
    throw error;
  }
};

const getCategories = async (user, queryFilter = {}, options = {}) => {
  try {
    const { q, sort } = queryFilter;
    const { includeDeleted = false } = options;

    const query = {
      ...(user.role !== "Admin Manager" && {
        department: user.department.name.toLowerCase(),
      }),
      ...(q && {
        name: { $regex: q, $options: "i" },
      }),
      isDeleted: includeDeleted ? true : false,
    };

    Object.keys(query).forEach(
      (key) => query[key] === undefined && delete query[key],
    );

    const sortMap = {
      "name-asc": { name: 1 },
      "name-desc": { name: -1 },
      "files-desc": { filesCount: -1 },
      "files-asc": { filesCount: 1 },
      "updated-desc": { updatedAt: -1 },
      "updated-asc": { updatedAt: 1 },
    };

    return await Category.find(query)
      .sort(sortMap[sort] || {})
      .lean();
  } catch (error) {
    console.error("Error in getCategories:", error);
    throw error;
  }
};

const createCategory = async (categoryData) => {
  const { name, department, createdBy } = categoryData;
  try {
    const existingCategory = await Category.findOne({
      name: name.toLowerCase(),
      department,
      createdBy,
    });
    if (existingCategory) {
      throw new Error(
        "Category with this name already exists in the department",
      );
    }

    const newCategory = new Category({
      name: name.toLowerCase(),
      department,
      createdBy,
    });
    await newCategory.save();
    return newCategory;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
};

const uploadDocument = async (file, fileData, user) => {
  console.log(file);
  const dataBuild = {
    name: fileData.name,
    fileName: fileData.fileName,
    filePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    extension: file.originalname.split(".").pop().toLowerCase(),
    category: fileData.category,
    department: user.department.name,
    uploadedBy: {
      id: user.id.toString(),
      name: user.displayName || user.name,
      email: user.email,
      department: user.department.name,
    },
  };
  const response = await Document.create(dataBuild);
  return response;
};

const getFilesByCategory = async (user, category) => {
  try {
    const department = user.department.name.toLowerCase();

    return await Document.find({
      department,
      category: category,
    })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("Error in getFilesByCategory:", error);
    throw error;
  }
};

const renameCategory = async (payload) => {
  try {
    const category = await Category.findByIdAndUpdate(
      payload.id,
      {
        name: payload.name.toLowerCase(),
      },
      { new: true, runValidators: true },
    );
    return category;
  } catch (error) {
    console.error("Error in renameCategory:", error);
    throw error;
  }
};

const deleteCategory = async (payload) => {
  try {
    const category = await Category.findByIdAndUpdate(
      payload.id,
      { isDeleted: payload.deleted },
      { returnDocument: "after", runValidators: true },
    );
    return category;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
};

module.exports = {
  getDocumentsData,
  getCategories,
  createCategory,
  uploadDocument,
  getFilesByCategory,
  renameCategory,
  deleteCategory,
};
