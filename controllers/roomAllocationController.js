// controllers/roomAllocationController.js

const Room = require("../models/Room");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");


//  Assign Room (Admin/Warden)
exports.assignRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    const student = await User.findById(studentId);
    const room = await Room.findById(roomId);

    if (!student || !room) {
      return res.json({ message: "Student or Room not found" });
    }

    //  Already has room
    if (student.room) {
      return res.json({ message: "Student already assigned a room" });
    }

    //  Room full
    if (room.occupants.length >= room.capacity) {
      return res.json({ message: "Room is full" });
    }

    if (student.gender !== room.block) {
      return res.status(400).json({ message: `Gender mismatch: This room is for ${room.block} students only` });
    }

    // Warden gender check
    if (req.user.role === 'warden' && req.user.gender !== room.block) {
      return res.status(403).json({ message: `Access denied: You can only assign rooms in the ${req.user.gender} hostel` });
    }

if (room.occupants.includes(studentId)) {
  return res.json({ message: "Already in room" });
}

    //  Assign
    room.occupants.push(studentId);
    student.room = roomId;

    await room.save();
    await student.save();

    // Send email to student
    if (student.email) {
      const subject = "Hostel Room Allocated";
      const html = `
        <h2>Room Allocation Successful</h2>
        <p>Hello ${student.name},</p>
        <p>A room has been allocated to you in the hostel.</p>
        <p><strong>Room Number:</strong> ${room.roomNumber}</p>
        <p><strong>Block:</strong> ${room.block} Hostel</p>
        <p><strong>Room Type:</strong> ${room.type}</p>
        <p>You can now check your dashboard for roommate details.</p>
      `;
      try {
        await sendEmail(student.email, subject, html);
      } catch (emailError) {
        console.error("Failed to send allocation email:", emailError);
      }
    }

    res.json({
      success: true,
      message: "Room assigned successfully",
      room
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

// Remove student from room

exports.vacateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    const room = await Room.findById(student.room);

    if (!room) {
      return res.json({ message: "Room not found" });
    }

    // Warden gender check
    if (req.user.role === 'warden' && req.user.gender !== room.block) {
      return res.status(403).json({ message: `Access denied: You can only manage rooms in the ${req.user.gender} hostel` });
    }

    // remove student from occupants
    room.occupants = room.occupants.filter(
      id => id.toString() !== studentId
    );

    student.room = null;

    await room.save();
    await student.save();

    // Send email to student
    if (student.email) {
      const subject = "Hostel Room Vacated";
      const html = `
        <h2>Room Vacated</h2>
        <p>Hello ${student.name},</p>
        <p>Your room (Room ${room.roomNumber}, ${room.block} Block) has been marked as vacated.</p>
        <p>If this was not expected, please contact the hostel administration.</p>
      `;
      try {
        await sendEmail(student.email, subject, html);
      } catch (emailError) {
        console.error("Failed to send vacate email:", emailError);
      }
    }

    res.json({
      message: "Room vacated successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getRoomDetails = async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId)
    .populate("occupants");

  res.json(room);
};

exports.getAvailableRooms = async (req, res) => {
  const rooms = await Room.find().populate("occupants", "name email");
  res.json(rooms);
};

