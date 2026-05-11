// controllers/complaintController.js
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

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
      const html = `
        <h2>New Complaint Registered</h2>
        <p><strong>Student Name:</strong> ${student.name}</p>
        <p><strong>Type:</strong> ${complaint.type}</p>
        <p><strong>Description:</strong> ${complaint.description}</p>
        <p><strong>Date:</strong> ${complaint.createdAt}</p>
      `;
      
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
      const html = `
        <h2>Your Complaint Status has been Updated</h2>
        <p><strong>Complaint Type:</strong> ${updated.type}</p>
        <p><strong>New Status:</strong> <span style="color: ${updated.status === 'Resolved' ? 'green' : 'orange'}">${updated.status}</span></p>
        <p><strong>Assigned To:</strong> ${updated.assignedTo || "Not yet assigned"}</p>
        <p>Thank you for your patience.</p>
      `;

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