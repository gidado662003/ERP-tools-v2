const MaterialRequest = require("../../../models/materialRequestSchema");

const MaterialRequestService = {
  getMaterialRequests: async () => {
    return await MaterialRequest.find()
      .populate("items.inventory")
      .populate("items.product");
  },

  getMaterialRequestById: async (id) => {
    return await MaterialRequest.findById(id)
      .populate("items.inventory")
      .populate("items.product");
  },

  createMaterialRequest: async (data, user) => {
    const requestNumber = `MR-${Date.now()}`;
    const requestedBy = {
      name: user.name,
      email: user.email,
      userId: user._id ?? user.id,
    };
    const { reason, items } = data;
    if (!reason || !items || !requestedBy) {
      throw new Error("Missing required fields: reason, items, requestedBy");
    }
    console.log({
      ...data,
      requestNumber,
      requestedBy,
    });
    const materialRequest = await MaterialRequest.create({
      ...data,
      requestNumber,
      requestedBy,
    });
    return materialRequest;
  },

  updateMaterialRequest: async (id, data) => {
    return await MaterialRequest.findByIdAndUpdate(id, data, { new: true })
      .populate("items.inventory")
      .populate("items.product");
  },

  deleteMaterialRequest: async (id) => {
    return await MaterialRequest.findByIdAndDelete(id);
  },
};

module.exports = MaterialRequestService;
