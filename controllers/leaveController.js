// controllers/leaveController.js

const Leave = require("../models/Leave");
const User = require("../models/User");


// Student: Apply Leave
exports.applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.json({ message: "All fields required" });
    }

    const leave = await Leave.create({
      student: req.user.id,
      fromDate,
      toDate,
      reason
    });

    res.json({
      success: true,
      message: "Leave applied",
      data: leave
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


//  Student: My Leave History
exports.getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ student: req.user.id });
  res.json(leaves);
};


//  Warden/Admin: View All Leave Requests
exports.getAllLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const leaves = await Leave.find(query).populate("student");
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//  Warden: Approve / Reject Leave
exports.updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const leave = await Leave.findById(id);

  if (!leave) {
    return res.json({ message: "Leave not found" });
  }

  leave.status = status;
  leave.approvedBy = req.user.id;

  await leave.save();

  res.json({
    message: `Leave ${status}`,
    leave
  });
};