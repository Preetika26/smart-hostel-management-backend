// routes/leaveRoutes.js

const router = require("express").Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require("../controllers/leaveController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isWardenOrAdmin } = require("../middleware/roleMiddleware");

// Student
router.post("/apply", verifyToken, applyLeave);
router.get("/my", verifyToken, getMyLeaves);

// Warden/Admin
router.get("/all", verifyToken, isWardenOrAdmin, getAllLeaves);
router.put("/:id", verifyToken, isWardenOrAdmin, updateLeaveStatus);

module.exports = router;