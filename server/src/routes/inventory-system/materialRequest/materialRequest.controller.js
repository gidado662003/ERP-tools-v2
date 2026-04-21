const MaterialRequestService = require("./materialRequest.service");
const materialRequestController = {
  getMaterialRequests: async (req, res) => {
    try {
      const materialRequests =
        await MaterialRequestService.getMaterialRequests();
      res.json(materialRequests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMaterialRequestById: async (req, res) => {
    try {
      const materialRequest =
        await MaterialRequestService.getMaterialRequestById(req.params.id);
      res.json(materialRequest);
    } catch (error) {
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

  updateMaterialRequest: async (req, res) => {
    try {
      const materialRequest =
        await MaterialRequestService.updateMaterialRequest(
          req.params.id,
          req.body,
        );
      if (!materialRequest) {
        return res.status(404).json({ message: "Material request not found" });
      }
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
  getMaterialRequestById: async (req, res) => {
    try {
      const materialRequest = await MaterialRequest.findById(req.params.id)
        .populate("items.inventory")
        .populate("items.product");
      if (!materialRequest) {
        return res.status(404).json({ message: "Material request not found" });
      }
      res.json(materialRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateMaterialRequest: async (req, res) => {
    try {
      const materialRequest = await MaterialRequest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      )
        .populate("items.inventory")
        .populate("items.product");
      if (!materialRequest) {
        return res.status(404).json({ message: "Material request not found" });
      }
      res.json(materialRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteMaterialRequest: async (req, res) => {
    try {
      const materialRequest = await MaterialRequest.findByIdAndDelete(
        req.params.id,
      );
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
