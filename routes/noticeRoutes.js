// routes/noticeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const noticeController = require("../controllers/noticeController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Routes
// Admin or Warden can upload
router.post("/upload", verifyToken, isAdmin, upload.single("file"), noticeController.uploadNotice);
router.delete("/:id", verifyToken, isAdmin, noticeController.deleteNotice);

// Everyone can view notices
router.get("/", verifyToken, noticeController.getNotices);

module.exports = router;
