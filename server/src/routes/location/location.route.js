const express = require("express");
const router = express.Router();
const locationController = require("./location.controller");

router.get("/", locationController.getLocationsController);
router.get("/name", locationController.getLocationByNameController);
router.post("/", locationController.createLocationController);

module.exports = router;
