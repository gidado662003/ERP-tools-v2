const materialRequestController = require("./materialRequest.controller");
const express = require("express");
const router = express.Router();

router.get("/", materialRequestController.getMaterialRequests);

router.get("/:id", materialRequestController.getMaterialRequestById);

router.post("/create", materialRequestController.createMaterialRequest);

router.patch("/:id/approve", materialRequestController.approveRequest);
router.patch("/:id/reject", materialRequestController.rejectRequest);
router.patch("/:id/dispatch", materialRequestController.dispatchRequest);

router.delete("/:id", materialRequestController.deleteMaterialRequest);

module.exports = router;
