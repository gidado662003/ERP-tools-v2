const Category = require("../models/category.schema");

const defaultCategories = [
  { name: "expenses", description: "General expenses" },
  { name: "equipment-procured", description: "Procured equipment" },
  { name: "refunds", description: "Refund items" },
];

const seedCategories = async () => {
  try {
    await Category.insertMany(defaultCategories, { ordered: false });
    console.log("✅ Default categories ensured");
  } catch (error) {
    if (error.code === 11000) {
      console.log("ℹ️ Some categories already exist, skipping duplicates");
    } else {
      console.error("❌ Seeding error:", error.message);
    }
  }
};

module.exports = seedCategories;
