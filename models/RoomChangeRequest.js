// models/RoomChangeRequest.js
const mongoose = require("mongoose");

const roomChangeRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  requestedRoomType: {
    type: String,
    enum: ["Single", "Double", "Triple"]
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  rejectionReason: {
    type: String
  },
  newRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("RoomChangeRequest", roomChangeRequestSchema);
