const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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