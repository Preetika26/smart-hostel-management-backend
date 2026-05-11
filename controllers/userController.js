
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


//  Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, gender: user.gender },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};



// Create User (Public Signup — forces student role)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, gender, address, fatherName, mobileNumber, alternateMobileNumber } = req.body;
    const idProof = req.file ? req.file.path : null;

    // validation
    if (!name || !email || !password || !gender) {
      return res.status(400).json({ status: 400, success: false, message: "Please provide all fields" });
    }

    // duplicate user
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ status: 400, success: false, message: "User already exists" });
    }

    // password hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Public signup always creates a student (ignore any role passed)
    const newUser = new User({
      name,
      email,
      password: hash,
      gender,
      address,
      fatherName,
      mobileNumber,
      alternateMobileNumber,
      idProof,
      role: "student",
      isVerified: false
    });

    await newUser.save();

    res.status(201).json({
      status: 201,
      success: true,
      message: "User created successfully. Awaiting admin verification."
    });

  } catch (error) {
    res.status(500).json({ status: 500, success: false, message: error.message });
  }
};


// Admin Only: Create Warden
exports.createWarden = async (req, res) => {
  try {
    const { name, email, password, gender, address, mobileNumber } = req.body;
    const idProof = req.file ? req.file.path : null;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({ status: 400, success: false, message: "Please provide all fields" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ status: 400, success: false, message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const warden = new User({
      name,
      email,
      password: hash,
      role: "warden",
      gender,
      address,
      mobileNumber,
      idProof,
      isVerified: true
    });

    await warden.save();

    res.status(201).json({
      status: 201,
      success: true,
      message: "Warden created successfully",
      user: {
        id: warden._id,
        name: warden.name,
        email: warden.email,
        role: warden.role
      }
    });

  } catch (error) {
    res.status(500).json({ status: 500, success: false, message: error.message });
  }
};


//  Login User

exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check user
    const user = await User.findOne({ email }).populate("room");
    if (!user) {
      return res.status(400).json({ status: 400, success: false, message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 400, success: false, message: "Invalid credentials" });
    }

    // Check role match
    if (role && user.role !== role) {
      return res.status(403).json({ status: 403, success: false, message: `Access denied. You are not a ${role}.` });
    }

    // Check verification (for students)
    if (user.role === "student" && !user.isVerified) {
      return res.status(403).json({ status: 403, success: false, message: "Account not verified by admin" });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        room: user.room,
        token
      }
    });

  } catch (error) {
    res.status(500).json({ status: 500, success: false, message: error.message });
  }
};

// Logout User
exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ status: 200, success: true, message: "Logged out successfully" });
};



//  Get All Users (Admin Only)

exports.getAllUsers = async (req, res) => {
  try {
    let query = { role: { $ne: "admin" } };
    if (req.user.role === 'warden') {
      query.gender = req.user.gender;
    }
    const users = await User.find(query).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//  Get Single User

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "room",
        populate: { path: "occupants", select: "name" }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Update User (Admin)

exports.updateUser = async (req, res) => {
  try {
    const { name, email, gender, address, fatherName, mobileNumber, alternateMobileNumber, password } = req.body;
    const idProof = req.file ? req.file.path : null;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    user.address = address || user.address;
    user.fatherName = fatherName || user.fatherName;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.alternateMobileNumber = alternateMobileNumber || user.alternateMobileNumber;
    if (idProof) user.idProof = idProof;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User updated successfully",
      updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//  Delete User (Admin)

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Verify Student (Admin)

exports.verifyStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Student verified successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
