const Category = require("../models/category.schema");

const defaultCategories = [
  { name: "expenses", description: "General expenses" },
  { name: "equipment-procured", description: "Procured equipment" },
  { name: "refunds", description: "Refund items" },
];

const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();

    // 👇 only seed if empty
    if (count === 0) {
      await Category.insertMany(defaultCategories);
      console.log("✅ Default categories seeded");
    } else {
      console.log("ℹ️ Categories already exist, skipping seed");
    }
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
  }
};

module.exports = seedCategories;
