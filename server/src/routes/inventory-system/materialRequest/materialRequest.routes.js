const materialRequestController = require("./materialRequest.controller");
const express = require("express");
const router = express.Router();

router.get("/", materialRequestController.getMaterialRequests);

router.get("/:id", materialRequestController.getMaterialRequestById);

router.post("/create", materialRequestController.createMaterialRequest);

router.put("/:id", materialRequestController.updateMaterialRequest);

router.delete("/:id", materialRequestController.deleteMaterialRequest);

module.exports = router;
