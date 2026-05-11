// routes/feeRoutes.js

const router = require("express").Router();

const {
  assignFee,
  getMyFees,
  getAllFees,
  payFee
} = require("../controllers/feeController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Admin
router.post("/assign", verifyToken, isAdmin, assignFee);
router.get("/all", verifyToken, isAdmin, getAllFees);

// Student
router.get("/my", verifyToken, getMyFees);
router.put("/pay/:id", verifyToken, payFee);

module.exports = router;