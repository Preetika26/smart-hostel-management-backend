// models/Fee.js

const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  amount: Number,
  dueDate: Date,
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  },
  fine: {
    type: Number,
    default: 0
  },
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);