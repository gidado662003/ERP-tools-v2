const {
  getMeetings: getMeetingsService,
  getMeetingById: getMeetingByIdService,
  createMeeting: createMeetingService,
  getActionItem: getActionItemService,
  getDashboardData: getDashboardDataService,
  updateActionItemStatus: updateActionItemStatusService,
} = require("./meeting.service");

const getMeetings = async (req, res) => {
  try {
    const data = await getMeetingsService(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await getMeetingByIdService(id);
    res.status(200).json(meeting);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const createMeeting = async (req, res) => {
  try {
    const user = req.user;
    const { meetingData, actionItemsData } = req.body;
    const { meeting, actionItems } = await createMeetingService({
      meetingData,
      actionItemsData,
      department: user.department,
    });

    res.status(201).json({
      message: "Meeting created successfully",
      meeting,
      actionItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const { date } = req.query;
    const { department } = req.user;
    const user = req.user;
    const meeting = await getDashboardDataService(date ?? "", department.name);
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActionItems = async (req, res) => {
  try {
    const user = req.authUser ??req.user;
    const query =  req.query;
    const actionItems = await getActionItemService(user, query);
    res.status(200).json({ success: true, actionItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateActionItemStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const response = await updateActionItemStatusService(user, id);
    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  getDashboardData,
  getActionItems,
  updateActionItemStatus,
};
