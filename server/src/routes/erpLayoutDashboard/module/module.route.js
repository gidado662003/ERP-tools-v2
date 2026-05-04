const express = require("express");
const moduleController = require("./module.controller");
const router = express.Router();

router.get("/", moduleController.getModules);
router.post("/", moduleController.createModule);
router.put("/:id", moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);
router.get("/:id", moduleController.getModuleById);
module.exports = router;
