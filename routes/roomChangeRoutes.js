// routes/roomChangeRoutes.js
const express = require("express");
const router = express.Router();
const roomChangeController = require("../controllers/roomChangeController");
const { verifyToken } = require("../middleware/authMiddleware");

// Admin or Warden
const isWardenOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "warden")) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied" });
  }
};

router.post("/request", verifyToken, roomChangeController.requestRoomChange);
router.get("/", verifyToken, roomChangeController.getRequests);
router.put("/:id/status", verifyToken, isWardenOrAdmin, roomChangeController.updateRequestStatus);

module.exports = router;
