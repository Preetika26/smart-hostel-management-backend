// controllers/disciplineController.js
const Discipline = require("../models/Discipline");
const User = require("../models/User");

exports.recordViolation = async (req, res) => {
  try {
    const { studentId, violation, type, actionTaken } = req.body;
    
    const record = new Discipline({
      student: studentId,
      issuedBy: req.user.id,
      violation,
      type,
      actionTaken
    });
    
    await record.save();
    res.status(201).json({ success: true, message: "Violation recorded successfully", record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentViolations = async (req, res) => {
  try {
    let filter = req.user.role === "student" ? { student: req.user.id } : {};
    
    if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      filter.student = { $in: studentIds };
    }

    if (req.params.studentId && req.user.role !== "student") {
      // If a specific student ID is requested, we should still verify gender for wardens
      if (req.user.role === 'warden') {
        const student = await User.findById(req.params.studentId);
        if (!student || student.gender !== req.user.gender) {
          return res.status(403).json({ success: false, message: "Access denied: Student belongs to another hostel block" });
        }
      }
      filter.student = req.params.studentId;
    }
    
    const records = await Discipline.find(filter)
      .populate("student", "name email gender")
      .populate("issuedBy", "name role");
      
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
