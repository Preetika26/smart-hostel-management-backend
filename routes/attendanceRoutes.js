// routes/attendanceRoutes.js

const router = require("express").Router();

const {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceSummary
} = require("../controllers/attendanceController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isWardenOrAdmin } = require("../middleware/roleMiddleware");

// Warden/Admin
router.post("/mark", verifyToken, isWardenOrAdmin, markAttendance);

// Student
router.get("/my", verifyToken, getMyAttendance);

// Admin/Warden
router.get("/all", verifyToken, isWardenOrAdmin, getAllAttendance);

// Report
router.get("/summary/:studentId", verifyToken, getAttendanceSummary);

module.exports = router;