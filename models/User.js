// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "warden", "student"],
    default: "student"
  },
  room: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Room"
},
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true
  },
  address: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  alternateMobileNumber: String,
  idProof: String,
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);