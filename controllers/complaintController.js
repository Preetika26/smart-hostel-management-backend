// controllers/complaintController.js
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");
const { buildEmailTemplate } = require("../utils/emailTemplate");

exports.createComplaint = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const complaint = await Complaint.create({
      ...req.body,
      student: req.user.id
    });

    // Find wardens of the same gender
    const wardens = await User.find({ role: "warden", gender: student.gender });

    if (wardens.length > 0) {
      const wardenEmails = wardens.map(w => w.email).join(",");
      const subject = `New Complaint from ${student.name}`;
      const html = buildEmailTemplate({
        title: "New Complaint Registered",
        subtitle: "Warden action may be required.",
        intro: "A student from your hostel has submitted a new complaint.",
        sections: [
          { label: "Student Name", value: student.name },
          { label: "Type", value: complaint.type },
          { label: "Description", value: complaint.description },
          { label: "Date", value: new Date(complaint.createdAt).toLocaleString() },
        ],
      });
      
      try {
        await sendEmail(wardenEmails, subject, html);
      } catch (emailError) {
        console.error("Failed to send email to wardens:", emailError);
      }
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const data = await Complaint.find(query).populate("student");
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const updated = await Complaint.findByIdAndUpdate(
      id,
      { status, assignedTo },
      { new: true }
    ).populate("student");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Send email to student
    if (updated.student && updated.student.email) {
      const subject = `Complaint Status Updated: ${updated.status}`;
      const html = buildEmailTemplate({
        title: "Complaint Status Updated",
        subtitle: `Current status: ${updated.status}`,
        intro: "There is an update on your complaint request.",
        sections: [
          { label: "Complaint Type", value: updated.type },
          { label: "New Status", value: updated.status },
          { label: "Assigned To", value: updated.assignedTo || "Not yet assigned" },
        ],
        footerNote: "Thank you for your patience. Contact hostel administration for urgent issues.",
      });

      try {
        await sendEmail(updated.student.email, subject, html);
      } catch (emailError) {
        console.error("Failed to send email to student:", emailError);
      }
    }

    res.json({ success: true, message: "Complaint updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
