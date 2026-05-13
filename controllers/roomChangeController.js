// controllers/roomChangeController.js
const RoomChangeRequest = require("../models/RoomChangeRequest");
const User = require("../models/User");
const Room = require("../models/Room");
const { sendEmail } = require("../utils/emailService");
const { buildEmailTemplate } = require("../utils/emailTemplate");

exports.requestRoomChange = async (req, res) => {
  try {
    const { currentRoom, requestedRoomType, reason } = req.body;
    
    const user = await User.findById(req.user.id).populate("room");
    if (!user.room) {
      return res.status(400).json({ success: false, message: "You are not assigned to any room yet" });
    }
    
    const request = new RoomChangeRequest({
      student: req.user.id,
      currentRoom: user.room._id,
      requestedRoomType,
      reason
    });
    
    await request.save();

    // Send email to wardens
    const wardens = await User.find({ role: "warden", gender: user.gender });
    if (wardens.length > 0) {
      const wardenEmails = wardens.map(w => w.email).join(",");
      const subject = `New Room Change Request: ${user.name}`;
      const html = buildEmailTemplate({
        title: "New Room Change Request",
        subtitle: "A student has requested room reassignment.",
        intro: "Please review the request details and take action in the portal.",
        sections: [
          { label: "Student Name", value: user.name },
          { label: "Current Room", value: `${user.room.roomNumber} (${user.room.block})` },
          { label: "Requested Type", value: requestedRoomType },
          { label: "Reason", value: reason },
        ],
      });
      try {
        await sendEmail(wardenEmails, subject, html);
      } catch (emailError) {
        console.error("Failed to send room change request email to wardens:", emailError);
      }
    }

    res.status(201).json({ success: true, message: "Room change request submitted", request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "student") {
      query = { student: req.user.id };
    } else if (req.user.role === 'warden') {
      const studentsOfGender = await User.find({ gender: req.user.gender, role: 'student' }).select('_id');
      const studentIds = studentsOfGender.map(s => s._id);
      query.student = { $in: studentIds };
    }
    const requests = await RoomChangeRequest.find(query)
      .populate("student", "name email gender")
      .populate("currentRoom", "roomNumber block")
      .populate("newRoom", "roomNumber block");
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason, newRoomId } = req.body;
    const updateData = {
      status,
      handledBy: req.user.id
    };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'Approved' && newRoomId) {
      updateData.newRoom = newRoomId;
    }

    const request = await RoomChangeRequest.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('student')
      .populate('newRoom');
    
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // Handle actual room change if approved
    if (status === 'Approved' && newRoomId) {
      const student = await User.findById(request.student._id);
      const oldRoomId = student.room;
      
      // 1. Remove from old room if exists
      if (oldRoomId) {
        await Room.findByIdAndUpdate(oldRoomId, {
          $pull: { occupants: student._id }
        });
      }

      // 2. Add to new room
      await Room.findByIdAndUpdate(newRoomId, {
        $addToSet: { occupants: student._id }
      });

      // 3. Update student profile
      student.room = newRoomId;
      await student.save();
    }

    // Send email to student
    if (request.student && request.student.email) {
      const subject = `Room Change Request ${status}`;
      const html =
        status === "Approved"
          ? buildEmailTemplate({
              title: "Room Change Request Approved",
              subtitle: `Hi ${request.student.name}, your request has been approved.`,
              intro: "Please shift your belongings to the newly assigned room by end of day.",
              sections: [
                { label: "Status", value: "Approved" },
                { label: "New Room", value: request.newRoom ? request.newRoom.roomNumber : "Assigned" },
              ],
            })
          : buildEmailTemplate({
              title: "Room Change Request Update",
              subtitle: `Hi ${request.student.name}, your request was not approved.`,
              intro: "You can raise a new request with additional details if needed.",
              sections: [
                { label: "Status", value: "Rejected" },
                { label: "Reason", value: rejectionReason || "Not specified" },
              ],
              footerNote: "If you need help, please contact your hostel warden.",
            });

      try {
        await sendEmail(request.student.email, subject, html);
      } catch (emailError) {
        console.error("Failed to send room change update email:", emailError);
      }
    }
    
    res.json({ success: true, message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

