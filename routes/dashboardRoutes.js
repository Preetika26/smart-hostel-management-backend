// routes/dashboardRoutes.js

const router = require("express").Router();

const {
  getOccupancy,
  getFeeReport,
  getComplaintStats,
  getAttendanceStats,
  getLeaveStats
} = require("../controllers/dashboardController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/occupancy", verifyToken, isAdmin, getOccupancy);
router.get("/fees", verifyToken, isAdmin, getFeeReport);
router.get("/complaints", verifyToken, isAdmin, getComplaintStats);
router.get("/attendance", verifyToken, isAdmin, getAttendanceStats);
router.get("/leaves", verifyToken, isAdmin, getLeaveStats);

module.exports = router;