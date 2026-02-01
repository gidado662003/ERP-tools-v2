const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getPriorityDistribution,
  getAmountRanges,
  getApprovalTrends,
  getDepartmentTrends,
  getProcessingTimeDistribution,
  getHourlyPatterns,
} = require('./dashboard.controller');

router.get('/metrics', getDashboardMetrics);
router.get('/priority-distribution', getPriorityDistribution);
router.get('/amount-ranges', getAmountRanges);
router.get('/approval-trends', getApprovalTrends);
router.get('/department-trends', getDepartmentTrends);
router.get('/processing-time-distribution', getProcessingTimeDistribution);
router.get('/hourly-patterns', getHourlyPatterns);

module.exports = router;