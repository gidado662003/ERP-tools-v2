const InternalRequisition = require("../../../models/internal-requsitions-schema")


async function getAllDataFigures(req, res) {
  try {
    const result = await InternalRequisition.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    const figures = {
      countTotal: 0,
      approvedTotal: 0,
      pendingTotal: 0,
      rejectedTotal: 0,
      outstandingTotal: 0,
    };

    result.forEach(item => {
      figures.countTotal += item.count;

      if (item._id === "approved") figures.approvedTotal = item.count;
      if (item._id === "pending") figures.pendingTotal = item.count;
      if (item._id === "rejected") figures.rejectedTotal = item.count;
      if (item._id === "outstanding") figures.rejectedTotal = item.count;
    });
    res.status(200).json(figures);
  } catch {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch requisition figures" });
  }
}
async function getAllData(req, res) {
  try {
    const { search, status, bank, cursorTimestamp, cursorId } = req.query;
    const limit = 10;

    const filters = [];

    // Cursor pagination
    if (cursorTimestamp && cursorId) {
      filters.push({
        $or: [
          { createdAt: { $lt: new Date(cursorTimestamp) } },
          {
            createdAt: new Date(cursorTimestamp),
            _id: { $lt: cursorId }
          }
        ]
      });
    }

    // Search filter
    if (search) {
      filters.push({
        $or: [
          { department: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { bank: { $regex: search, $options: "i" } },
          { requisitionNumber: { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } }
        ]
      });
    }


    if (status) filters.push({ status });
    if (bank) filters.push({ bank });

    const query = filters.length ? { $and: filters } : {};
    console.log(query)

    // Fetch limit + 1 to detect hasMore
    const results = await InternalRequisition
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor = null;
    if (hasMore) {
      const lastItem = data[data.length - 1];
      nextCursor = {
        timestamp: lastItem.createdAt,
        id: lastItem._id
      };
    }

    res.status(200).json({
      data,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting data" });
  }
}


async function getDataById(req, res) {
  try {
    const { id } = req.params
    const request = await InternalRequisition.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting data" });
  }
}
module.exports = { getAllDataFigures, getAllData, getDataById }