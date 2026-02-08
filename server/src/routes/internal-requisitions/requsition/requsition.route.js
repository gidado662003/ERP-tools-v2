const express = require("express");
const router = express.Router();
const {
  getAllDataFigures,
  getAllData,
  getDataById,
  createRequest,
  updateRequest,
} = require("./requsition.controller");
const upload = require("../../../config/multerconfig");

router.get("/list", getAllDataFigures);
router.get("/allrequest", getAllData);
router.get("/allrequest/:id", getDataById);
router.post("/create", upload.array("attachement"), createRequest);
router.put("/update/:id", updateRequest);
module.exports = router;
