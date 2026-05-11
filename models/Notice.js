// models/Notice.js
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String // To store the path of the uploaded file
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  type: {
    type: String,
    enum: ["Rule", "Notice", "Alert"],
    default: "Notice"
  }
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
