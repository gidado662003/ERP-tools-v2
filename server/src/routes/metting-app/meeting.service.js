const mongoose = require("mongoose");
const Meeting = require("../../models/meeting.schema");
const ActionItem = require("../../models/meetingActionItems.schema");

async function getMeetings(queryParams) {
  const { search, cursorTimestamp } = queryParams;

  const query = {};

  if (cursorTimestamp) {
    query.createdAt = {
      $lt: new Date(cursorTimestamp),
    };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { minutes: { $regex: search, $options: "i" } },
      { agenda: { $regex: search, $options: "i" } },
    ];
  }

  const meetings = await Meeting.find(query)
    .select("title date department status createdAt _id")
    .sort({ createdAt: -1 })
    .limit(8);

  const nextCursor =
    meetings.length > 0 ? meetings[meetings.length - 1].createdAt : null;

  return { meetings, nextCursor };
}

async function getMeetingById(id) {
  if (!id) {
    const error = new Error("Meeting id is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid meeting id");
    error.statusCode = 400;
    throw error;
  }

  const meeting = await Meeting.findById(id)
    .populate("attendees", "name email")
    .populate("actionItems")
    .lean();

  if (!meeting) {
    const error = new Error("Meeting not found");
    error.statusCode = 404;
    throw error;
  }

  return meeting;
}

async function createMeeting(payload) {
  console.log("🚀 ~ createMeeting ~ payload:", payload);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { meetingData, actionItemsData, department } = payload;

    const meeting = await Meeting.create(
      [{ ...meetingData, department: department.name }],
      {
        session,
      },
    );

    let createdActionItems = [];

    if (actionItemsData && actionItemsData.length > 0) {
      const formattedItems = actionItemsData.map((item) => ({
        ...item,
        meetingId: meeting[0]._id,
      }));

      createdActionItems = await ActionItem.insertMany(formattedItems, {
        session,
      });

      meeting[0].actionItems = createdActionItems.map((item) => item._id);

      await meeting[0].save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      meeting: meeting[0],
      actionItems: createdActionItems,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function getDashboardData(dateParam, departmentParam) {
  let dateMatch = null;

  if (dateParam) {
    const [year, month] = dateParam.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    if (!isNaN(startDate) && !isNaN(endDate)) {
      dateMatch = { $gte: startDate, $lte: endDate };
    }
  }

  const meetingFilter = {
    ...(dateMatch && { date: dateMatch }),
    ...(departmentParam && { department: departmentParam }),
  };

  const now = new Date();

  const [
    meetingsCount,
    actionStats,
    topOwners,
    departmentBreakdown,
    recentMeetings,
    recentActionItems,
  ] = await Promise.all([
    Meeting.countDocuments(meetingFilter),

    ActionItem.aggregate([
      { $match: { ...(dateMatch && { createdAt: dateMatch }) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$due", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    ActionItem.aggregate([
      {
        $match: {
          $or: [
            { due: { $lt: now }, status: { $ne: "completed" } },
            { penalty: { $exists: true, $ne: "", $nin: ["N/A"] } },
          ],
        },
      },
      { $unwind: "$owner" },
      {
        $group: {
          _id: "$owner.username",
          overdueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$due", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          penaltyCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$penalty", null] },
                    { $ne: ["$penalty", "N/A"] },
                    { $ne: ["$penalty", ""] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { overdueCount: -1, penaltyCount: -1 } },
      { $limit: 10 },
    ]),

    // Per-department breakdown: meeting count + action item stats per dept
    Meeting.aggregate([
      { $match: { ...(dateMatch && { date: dateMatch }) } },
      {
        $group: {
          _id: "$department",
          meetingCount: { $sum: 1 },
          actionItemIds: { $push: "$actionItems" },
        },
      },
      {
        $project: {
          department: "$_id",
          meetingCount: 1,
          // Flatten the nested arrays of actionItem ObjectIds
          actionItemIds: {
            $reduce: {
              input: "$actionItemIds",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "actionitems",
          localField: "actionItemIds",
          foreignField: "_id",
          as: "actionItems",
        },
      },
      {
        $project: {
          _id: 0,
          department: 1,
          meetingCount: 1,
          totalActions: { $size: "$actionItems" },
          completedActions: {
            $size: {
              $filter: {
                input: "$actionItems",
                as: "a",
                cond: { $eq: ["$$a.status", "completed"] },
              },
            },
          },
          overdueActions: {
            $size: {
              $filter: {
                input: "$actionItems",
                as: "a",
                cond: {
                  $and: [
                    { $ne: ["$$a.status", "completed"] },
                    { $lt: ["$$a.due", now] },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { meetingCount: -1 } },
    ]),

    // Recent meetings (last 5)
    Meeting.find(meetingFilter)
      .sort({ date: -1 })
      .limit(5)
      .select("title department date status attendees")
      .lean(),

    // Recent action items (last 5, most recently created)
    ActionItem.find({ ...(dateMatch && { createdAt: dateMatch }) })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("desc owner due status penalty createdAt")
      .lean(),
  ]);

  const actions = actionStats[0] || { total: 0, completed: 0, overdue: 0 };

  return {
    meetings: meetingsCount,
    actions,
    topOwners,
    departmentBreakdown,
    recentActivity: {
      meetings: recentMeetings,
      actionItems: recentActionItems,
    },
  };
}

async function getActionItem(user, queryParam) {
  let query = {};
  const admin =
    process.env.NODE_ENV === "development" || user.role === "Admin Manager";

  if (!admin) {
    query["owner.user"] = user.id ?? user._id;
  }

  if (queryParam?.status) {
    query.status = queryParam.status;
  }
  const items = await ActionItem.find(query)
    .populate("meetingId", "title department date")
    .sort({ createdAt: -1 });
  return items;
}

async function updateActionItemStatus(user, _id) {
  let query = { _id };
  const admin =
    process.env.NODE_ENV === "development" || user.role === "Admin Manager";
  if (!admin) {
    query["owner.user"] = user.id ?? user._id;
  }
  const existingDoc = await ActionItem.findOne(query);

  if (!existingDoc) {
    throw new Error("Item not found");
  }

  existingDoc.status = "completed";
  existingDoc.completedAt = new Date();
  const res = await existingDoc.save();
  return { title: res.desc };
}

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  getDashboardData,
  getActionItem,
  updateActionItemStatus,
};
