// models/Complaint.js
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  description: String,
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  },
  assignedTo: { type: String } // Can be maintenance staff name or role
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);