// controllers/noticeController.js
const Notice = require("../models/Notice");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");
const { uploadBufferToImageKit } = require("../utils/uploadService");
const { buildEmailTemplate } = require("../utils/emailTemplate");

exports.uploadNotice = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    let fileUrl = null;

    if (req.file) {
      const uploadResult = await uploadBufferToImageKit({
        file: req.file,
        folder: "/smart-hostel/notices",
      });
      fileUrl = uploadResult?.url || null;
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
        const html = buildEmailTemplate({
          title: "New Notice Posted",
          subtitle: "Please review the latest update.",
          intro: "A new notice has been published in the hostel portal.",
          sections: [
            { label: "Title", value: title },
            { label: "Category", value: type || "General" },
            { label: "Description", value: description || "No description provided" },
          ],
          actionText: fileUrl ? "View Attachment" : undefined,
          actionUrl: fileUrl || undefined,
          footerNote: "Please log in to the portal for full details and follow-up actions.",
        });
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
