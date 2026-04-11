const InternalRequisition = require("../../../models/internal-requsitions-schema");
const requisitionService = require("../../../services/internalRequisition.service");
const Sentry = require("@sentry/node");

async function getAllDataFigures(req, res) {
  try {
    const figures = await requisitionService.getAllDataFigures(req.user);
    res.status(200).json(figures);
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      tags: { section: "get-all-data-figures" },
      extra: {
        userId: req.user?.id,
        department: req.user?.department,
      },
    });
    res.status(500).json({ message: "Failed to fetch requisition figures" });
  }
}

async function getAllData(req, res) {
  try {
    const result = await requisitionService.getAllData(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      tags: { section: "get-all-data" },
      extra: {
        userId: req.user?.id,
        department: req.user?.department,
        query: req.query,
      },
    });
    res.status(500).json({ message: "Error getting data" });
  }
}

async function getDataById(req, res) {
  try {
    const { id } = req.params;
    const request = await requisitionService.getDataById(id);
    res.status(200).json(request);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    Sentry.captureException(error, {
      tags: { section: "get-data-by-id" },
      extra: {
        userId: req.user?.id,
        requisitionId: req.params.id,
      },
    });
    res.status(500).json({ message: "Error getting data" });
  }
}

async function createRequest(req, res) {
  try {
    const request = await requisitionService.createRequest({
      user: req.user,
      body: req.body,
      files: req.files,
    });
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, {
      tags: { section: "create-internal-request" },
      extra: {
        userId: req.user?.id,
        department: req.user?.department,
        body: req.body,
      },
    });
    res.status(500).json({ message: "Error submitting request" });
  }
}

async function updateRequest(req, res) {
  const { id } = req.params;
  const data = req.body;

  try {
    const response = await requisitionService.updateRequest(id, data, req.user);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 403) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this request" });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ message: "Not found" });
    }
    Sentry.captureException(error, {
      tags: { section: "update-request" },
      extra: {
        userId: req.user?.id,
        department: req.user?.department,
        requisitionId: id,
        updatePayload: data,
      },
    });
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
