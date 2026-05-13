const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Auth
router.post("/register", upload.single("idProof"), userController.createUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);

// Admin: Create Warden (only admin can do this)
router.post("/create-warden", verifyToken, isAdmin, upload.single("idProof"), userController.createWarden);

// Admin routes
router.get("/", verifyToken, userController.getAllUsers);
router.put("/:id", verifyToken, isAdmin, upload.single("idProof"), userController.updateUser);
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);
router.put("/verify/:id", verifyToken, isAdmin, userController.verifyStudent);

// Common
router.get("/:id", verifyToken, userController.getUserById);

module.exports = router;