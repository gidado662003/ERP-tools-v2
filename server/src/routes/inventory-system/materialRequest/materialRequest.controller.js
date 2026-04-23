const MaterialRequestService = require("./materialRequest.service");
const materialRequestController = {
  getMaterialRequests: async (req, res) => {
    try {
      const materialRequests = await MaterialRequestService.getMaterialRequests(
        req.query,
      );
      res.json(materialRequests);
    } catch (error) {
      console.error("Error fetching material requests:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getMaterialRequestById: async (req, res) => {
    try {
      const materialRequest =
        await MaterialRequestService.getMaterialRequestById(req.params.id);
      res.json(materialRequest);
    } catch (error) {
      console.error("Error fetching material request:", error);
      res.status(500).json({ message: error.message });
    }
  },

  createMaterialRequest: async (req, res) => {
    try {
      const user = req.user;
      const materialRequest =
        await MaterialRequestService.createMaterialRequest(req.body, user);
      res.status(201).json("materialRequest");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  approveRequest: async (req, res) => {
    try {
      const user = req.user;
      const materialRequest = await MaterialRequestService.approveRequest(
        req.params.id,
        user,
      );

      res.json(materialRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  rejectRequest: async (req, res) => {
    try {
      const user = req.user;
      const materialRequest = await MaterialRequestService.rejectRequest(
        req.params.id,
        user,
        req.body.comment,
      );

      res.json(materialRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  dispatchRequest: async (req, res) => {
    try {
      const user = req.user;
      const materialRequest = await MaterialRequestService.dispatchRequest(
        req.params.id,
        user,
      );

      res.json(materialRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteMaterialRequest: async (req, res) => {
    try {
      const materialRequest =
        await MaterialRequestService.deleteMaterialRequest(req.params.id);
      if (!materialRequest) {
        return res.status(404).json({ message: "Material request not found" });
      }
      res.json({ message: "Material request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = materialRequestController;
