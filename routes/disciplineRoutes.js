// routes/disciplineRoutes.js
const express = require("express");
const router = express.Router();
const disciplineController = require("../controllers/disciplineController");
const { verifyToken } = require("../middleware/authMiddleware");

// Admin or Warden can issue (we handle role check logic in route or let's use a quick middleware here)
const isWardenOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "warden")) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied" });
  }
};

router.post("/record", verifyToken, isWardenOrAdmin, disciplineController.recordViolation);
router.get("/my", verifyToken, disciplineController.getStudentViolations);
router.get("/all", verifyToken, isWardenOrAdmin, disciplineController.getStudentViolations);
router.get("/student/:studentId", verifyToken, isWardenOrAdmin, disciplineController.getStudentViolations);

module.exports = router;
