const MaterialRequest = require("../../../models/materialRequestSchema");

const getUserInfo = (user) => ({
  name: user.name,
  email: user.email,
  userId: user._id ?? user.id,
});
const MaterialRequestService = {
  getMaterialRequests: async (params) => {
    const { status, search, cursor } = params;
    const query = {};
    const limit = 20;

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { requestNumber: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const data = await MaterialRequest.find(query)
      .populate("items.inventory")
      .populate("items.product")
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasNextPage = data.length > limit;
    if (hasNextPage) {
      data.pop();
    }
    let lastItemId = null;

    if (data.length > 0) {
      lastItemId = data[data.length - 1]._id;
    }

    return { data, hasNextPage, lastItemId };
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

  approveRequest: async (id, user) => {
    const request = await MaterialRequest.findById(id);

    if (!request) throw new Error("Request not found");

    if (request.status !== "PENDING") {
      throw new Error("Only pending requests can be approved");
    }

    request.status = "APPROVED";
    request.approvedBy = getUserInfo(user);
    request.approvedAt = new Date();

    await request.save();

    return request.populate("items.inventory items.product");
  },

  rejectRequest: async (id, user, rejectionReason) => {
    const request = await MaterialRequest.findById(id);

    if (!request) throw new Error("Request not found");

    if (request.status !== "PENDING") {
      throw new Error("Only pending requests can be rejected");
    }

    request.status = "REJECTED";
    request.rejectedBy = getUserInfo(user);
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason;

    await request.save();

    return request.populate("items.inventory items.product");
  },

  dispatchRequest: async (id, user) => {
    const request =
      await MaterialRequest.findById(id).populate("items.inventory");

    if (!request) throw new Error("Request not found");

    if (request.status !== "APPROVED") {
      throw new Error("Only approved requests can be dispatched");
    }

    for (const item of request.items) {
      const inventory = item.inventory;

      if (inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ${inventory._id}`);
      }

      inventory.quantity -= item.quantity;
      await inventory.save();
    }

    request.status = "DISPATCHED";
    request.dispatchedBy = getUserInfo(user);
    request.dispatchedAt = new Date();

    await request.save();

    return request.populate("items.inventory items.product");
  },

  deleteMaterialRequest: async (id) => {
    return await MaterialRequest.findByIdAndDelete(id);
  },
};

module.exports = MaterialRequestService;
