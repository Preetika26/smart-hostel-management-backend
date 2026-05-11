// models/Discipline.js
const mongoose = require("mongoose");

const disciplineSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  violation: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Warning", "Notice", "Strict Action"],
    default: "Warning"
  },
  actionTaken: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Discipline", disciplineSchema);
