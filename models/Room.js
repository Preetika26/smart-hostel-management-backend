// models/Room.js

const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },

  block: {
    type: String,
    enum: ["Male", "Female"],
    required: true
  },

  type: {
    type: String,
    enum: ["Single", "Double", "Triple"]
  },

  capacity: Number,

  occupants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

// Ensure unique room number per block
roomSchema.index({ roomNumber: 1, block: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);