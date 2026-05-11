// controllers/dashboardController.js

const Room = require("../models/Room");
const User = require("../models/User");
const Fee = require("../models/Fee");
const Complaint = require("../models/Complaint");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");


//  1. Hostel Occupancy Report
exports.getOccupancy = async (req, res) => {
  let query = {};
  if (req.user.role === 'warden') {
    query.block = req.user.gender;
  }
  const rooms = await Room.find(query);

  let totalCapacity = 0;
  let occupied = 0;

  rooms.forEach(room => {
    totalCapacity += room.capacity;
    occupied += room.occupants.length;
  });

  res.json({
    totalCapacity,
    occupied,
    available: totalCapacity - occupied
  });
};


// 2. Fee Report
exports.getFeeReport = async (req, res) => {
  const fees = await Fee.find();

  let total = 0, collected = 0, pending = 0;

  fees.forEach(fee => {
    total += fee.amount;

    if (fee.status === "Paid") {
      collected += fee.amount;
    } else {
      pending += fee.amount;
    }
  });

  res.json({
    total,
    collected,
    pending
  });
};


// 3. Complaint Stats
exports.getComplaintStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const complaints = await Complaint.find(query);

    let pending = 0, progress = 0, resolved = 0;

    complaints.forEach(c => {
      if (c.status === "Pending") pending++;
      else if (c.status === "In Progress") progress++;
      else if (c.status === "Resolved") resolved++;
    });

    res.json({
      total: complaints.length,
      pending,
      progress,
      resolved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 4. Attendance Overview
exports.getAttendanceStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const records = await Attendance.find(query);

    let present = 0, absent = 0, late = 0;

    records.forEach(r => {
      if (r.status === "Present") present++;
      else if (r.status === "Absent") absent++;
      else if (r.status === "Late") late++;
    });

    res.json({
      total: records.length,
      present,
      absent,
      late
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//  5. Leave Analytics
exports.getLeaveStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const leaves = await Leave.find(query);

    let pending = 0, approved = 0, rejected = 0;

    leaves.forEach(l => {
      if (l.status === "Pending") pending++;
      else if (l.status === "Approved") approved++;
      else if (l.status === "Rejected") rejected++;
    });

    res.json({
      total: leaves.length,
      pending,
      approved,
      rejected
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};