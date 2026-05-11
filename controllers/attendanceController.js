// controllers/attendanceController.js

const Attendance = require("../models/Attendance");
const User = require("../models/User");


//  Warden: Mark Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { student, date, status } = req.body;
   
    const start = new Date(date);
    start.setHours(0,0,0,0);

    const end = new Date(date);
    end.setHours(23,59,59,999);
    // prevent duplicate entry (same student + date)
    const exists = await Attendance.findOne({
  student,
  date: { $gte: start, $lte: end }
});

    if (exists) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = await Attendance.create({
      student,
      date,
      status,
      markedBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: "Attendance marked",
      data: attendance
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


//  Student: View My Attendance
exports.getMyAttendance = async (req, res) => {
  const data = await Attendance.find({
    student: req.user.id
  }).sort({ date: -1 });

  res.json(data);
};


//  Warden/Admin: View All Attendance
exports.getAllAttendance = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const data = await Attendance.find(query)
      .populate("student")
      .sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Report: Attendance Summary
exports.getAttendanceSummary = async (req, res) => {
  const { studentId } = req.params;

  const records = await Attendance.find({ student: studentId });

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
};