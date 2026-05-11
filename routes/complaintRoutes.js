// routes/complaintRoutes.js
const router = require("express").Router();
const {
  createComplaint,
  getComplaints,
  updateStatus
} = require("../controllers/complaintController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createComplaint);
router.get("/", verifyToken, getComplaints);
router.put("/:id", verifyToken, updateStatus);

module.exports = router;