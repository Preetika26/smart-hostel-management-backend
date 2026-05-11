// routes/roomAllocationRoutes.js

const router = require("express").Router();

const {
  assignRoom,
  vacateRoom,
  getRoomDetails,
  getAvailableRooms
} = require("../controllers/roomAllocationController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin, isWarden } = require("../middleware/roleMiddleware");

// Assign room
router.post("/assign", verifyToken, isWarden, assignRoom);

// Vacate
router.post("/vacate", verifyToken, isWarden, vacateRoom);

// View room
router.get("/:roomId", verifyToken, getRoomDetails);

// Available rooms
router.get("/", verifyToken, getAvailableRooms);

module.exports = router;