// routes/noticeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const noticeController = require("../controllers/noticeController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

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

// Routes
// Admin or Warden can upload
router.post("/upload", verifyToken, isAdmin, upload.single("file"), noticeController.uploadNotice);
router.delete("/:id", verifyToken, isAdmin, noticeController.deleteNotice);

// Everyone can view notices
router.get("/", verifyToken, noticeController.getNotices);

module.exports = router;
