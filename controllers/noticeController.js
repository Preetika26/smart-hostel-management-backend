// controllers/noticeController.js
const Notice = require("../models/Notice");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

exports.uploadNotice = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    let fileUrl = null;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const newNotice = new Notice({
      title,
      description,
      type: type || "Notice",
      fileUrl,
      uploadedBy: req.user ? req.user.id : null
    });

    await newNotice.save();

    // Send email to all users
    try {
      const users = await User.find({}, "email");
      const userEmails = users.map(u => u.email).filter(email => email).join(",");

      if (userEmails) {
        const subject = `Important Notice: ${title}`;
        const html = `
          <h2>New Notice Posted</h2>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Category:</strong> ${type || "General"}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p>${fileUrl ? `<a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${fileUrl}">View Attachment</a>` : ""}</p>
          <p>Please check the portal for more details.</p>
        `;
        await sendEmail(userEmails, subject, html);
      }
    } catch (emailError) {
      console.error("Failed to send notice emails:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Notice/Rule uploaded successfully",
      notice: newNotice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).populate("uploadedBy", "name role");
    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    
    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
