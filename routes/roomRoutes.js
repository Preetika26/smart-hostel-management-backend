// routes/roomRoutes.js
const router = require("express").Router();
const { createRoom, getRooms, getRoomById, updateRoom, deleteRoom } = require("../controllers/roomController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/", verifyToken, isAdmin, createRoom);
router.get("/", verifyToken, getRooms);
router.get("/:id", verifyToken, getRoomById);
router.put("/:id", verifyToken, isAdmin, updateRoom);
router.delete("/:id", verifyToken, isAdmin, deleteRoom);

module.exports = router;