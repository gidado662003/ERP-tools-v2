const express = require("express");
const router = express.Router();

const { category } = require("./internal-documents-category.controller");

router.get("/", category.getCategoriesController);
router.post("/", category.createCategoryController);
router.put("/rename/:id", category.renameCategoryController);
router.put("/delete/:id", category.deleteCategoryController);
router.put("/delete/:id", category.deleteCategoryController);
router.put("/recover/:id", category.recoverCategoryController);
router.get("/delete", category.getDeleteCategoryController);
module.exports = router;
