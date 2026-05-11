// controllers/roomController.js
const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const { type, roomNumber, block } = req.body;

    // Check for duplicate room number in the same block
    const existingRoom = await Room.findOne({ roomNumber, block });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room number ${roomNumber} already exists in the ${block} block` });
    }
    
    // Auto-set capacity based on type
    const capacities = {
      'Single': 1,
      'Double': 2,
      'Triple': 3
    };
    
    if (capacities[type]) {
      req.body.capacity = capacities[type];
    }

    const room = await Room.create(req.body);
    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'warden') {
      query.block = req.user.gender;
    }
    const rooms = await Room.find(query).populate("occupants", "name email");
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("occupants", "name email");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { type, roomNumber, block } = req.body;

    if (roomNumber || block) {
      // If updating roomNumber or block, check for collision
      const checkRoom = roomNumber || (await Room.findById(req.params.id)).roomNumber;
      const checkBlock = block || (await Room.findById(req.params.id)).block;
      
      const existingRoom = await Room.findOne({ 
        roomNumber: checkRoom, 
        block: checkBlock, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingRoom) {
        return res.status(400).json({ success: false, message: `Room number ${checkRoom} already exists in the ${checkBlock} block` });
      }
    }
    
    // Auto-set capacity based on type if type is being updated
    if (type) {
      const capacities = {
        'Single': 1,
        'Double': 2,
        'Triple': 3
      };
      if (capacities[type]) {
        req.body.capacity = capacities[type];
      }
    }

    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, message: "Room updated", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};