const {
  getLocations,
  getLocationByName,
  createLocation,
} = require("../../services/location.service");

const locationController = {
  getLocationsController: async (req, res) => {
    try {
      const { search } = req.query;
      const locations = await getLocations(search);
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  },
  getLocationByNameController: async (req, res) => {
    try {
      const { name } = req.query;
      const location = await getLocationByName(name);
      res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch location by name" });
    }
  },
  createLocationController: async (req, res) => {
    try {
      const location = await createLocation(req.body);
      res.status(201).json({
        message: "Location created successfully",
        location,
      });
    } catch (error) {
      res.status(400).json({
        error: error?.message || "Failed to create location",
      });
    }
  },
};

module.exports = locationController;
