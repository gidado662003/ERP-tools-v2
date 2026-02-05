const internalRequsitionsSchema = require("../../../models/internal-requsitions-schema");
const InternalRequisition = require("../../../models/internal-requsitions-schema");

async function getAllDataFigures(req, res) {
  try {
    const matchStage = {};

    if (req.user.department?.name !== "Finance") {
      matchStage.department = req.user.department.name;
    }

    const result = await InternalRequisition.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const figures = {
      countTotal: 0,
      approvedTotal: 0,
      pendingTotal: 0,
      rejectedTotal: 0,
      outstandingTotal: 0,
    };

    result.forEach((item) => {
      figures.countTotal += item.count;

      if (item._id === "approved") figures.approvedTotal = item.count;
      if (item._id === "pending") figures.pendingTotal = item.count;
      if (item._id === "rejected") figures.rejectedTotal = item.count;
      if (item._id === "outstanding") figures.outstandingTotal = item.count;
    });

    res.status(200).json(figures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch requisition figures" });
  }
}

async function getAllData(req, res) {
  try {
    const {
      search,
      status,
      bank,
      cursorTimestamp,
      cursorId,
      startDate,
      endDate,
    } = req.query;
    const limit = 10;

    const filters = [];
    // Only filter by department if user is NOT Finance AND NOT Admin Manager
    if (
      req.user.role !== "Admin Manager" &&
      req.user.department?.name !== "Finance"
    ) {
      filters.push({ department: req.user.department.name });
    }

    // Cursor pagination
    if (cursorTimestamp && cursorId) {
      filters.push({
        $or: [
          { createdAt: { $lt: new Date(cursorTimestamp) } },
          {
            createdAt: new Date(cursorTimestamp),
            _id: { $lt: cursorId },
          },
        ],
      });
    }

    // Search filter
    if (search) {
      filters.push({
        $or: [
          { department: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { "paymentHistory.bank": { $regex: search, $options: "i" } },
          { requisitionNumber: { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } },
        ],
      });
    }

    if (status) filters.push({ status });
    if (bank) filters.push({ bank });

    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.push({ createdAt: { $gte: new Date(startDate), $lte: end } });
    }

    const query = filters.length ? { $and: filters } : {};
    // Fetch limit + 1 to detect hasMore
    const results = await InternalRequisition.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor = null;
    if (hasMore) {
      const lastItem = data[data.length - 1];
      nextCursor = {
        timestamp: lastItem.createdAt,
        id: lastItem._id,
      };
    }
    const counts = await InternalRequisition.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const figures = {
      countTotal: 0,
      approvedTotal: 0,
      pendingTotal: 0,
      rejectedTotal: 0,
      outstandingTotal: 0,
    };
    counts.forEach((item) => {
      figures.countTotal += item.count;
      if (item._id === "approved") figures.approvedTotal = item.count;
      if (item._id === "pending") figures.pendingTotal = item.count;
      if (item._id === "rejected") figures.rejectedTotal = item.count;
      if (item._id === "outstanding") figures.outstandingTotal = item.count;
    });

    res.status(200).json({
      data,
      nextCursor,
      hasMore,
      counts: {
        countTotal: figures.countTotal,
        approvedTotal: figures.approvedTotal,
        pendingTotal: figures.pendingTotal,
        rejectedTotal: figures.rejectedTotal,
        outstandingTotal: figures.outstandingTotal,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting data" });
  }
}

async function getDataById(req, res) {
  try {
    const { id } = req.params;
    const request = await InternalRequisition.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting data" });
  }
}

async function createRequest(req, res) {
  try {
    const laravelUser = req.user;

    const user = {
      name: laravelUser.name || "",
      email: laravelUser.email || "",
      department: laravelUser.department.name || "",
      role: laravelUser.role || "user",
    };

    const items = JSON.parse(req.body.items);
    const accountToPay = JSON.parse(req.body.accountToPay);

    const attachments =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);

    const date = new Date();
    const requisitionNumber = `IR-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${Date.now().toString().slice(-6)}`;

    const request = await InternalRequisition.create({
      title: req.body.title,
      department: laravelUser.department.name,
      requestedOn: req.body.requestedOn,
      accountToPay,
      requisitionNumber,
      totalAmount,
      location: req.body.location,
      category: req.body.category,
      items,
      attachments,
      user,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting request" });
  }
}

async function updateRequest(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const request = await InternalRequisition.findById(id);

    if (req.user.department.name !== "Finance") {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this request" });
    }

    if (!request) return res.status(404).json({ message: "Not found" });

    request.status = data.status;

    if (data.status === "rejected") {
      request.rejectedOn = new Date();
      request.comment = data.financeComment;
    } else {
      request.approvedByFinance = {
        name: req.user.name,
        email: req.user.email,
        department: req.user.department.name,
      };

      if (data.amountPaid > 0) {
        request.paymentHistory.push({
          amount: data.amountPaid,
          comment: data.financeComment,
          bank: data.sourceBank,
          paidBy: req.user.name,
          paymentMethod: data.paymentMethod,
          date: new Date(),
        });
      }
    }

    const response = await request.save();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating request" });
  }
}

module.exports = {
  getAllDataFigures,
  getAllData,
  getDataById,
  createRequest,
  updateRequest,
};
