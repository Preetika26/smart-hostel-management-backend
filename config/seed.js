// require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected ✅"))
//   .catch(err => console.log("DB Error ❌", err));

// Models
const User = require("../models/User");
const Room = require("../models/Room");



//  Seed Function
const seedData = async () => {
  try {
    // Clear old data
    await User.deleteMany();
    await Room.deleteMany();

    console.log("Old data deleted");

    //  Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    //  Admin
    const admin = await User.create({
  name: "Admin",
  email: "admin@gmail.com",
  password: hashedPassword,
  role: "admin",
  gender: "Male", 
  isVerified: true
});

    //  Warden
    // const warden = await User.create({
    //   name: "Warden",
    //   email: "warden@gmail.com",
    //   password: hashedPassword,
    //   role: "warden",
    //   isVerified: true
    // });

    //  Student
    // const student = await User.create({
    //   name: "Student",
    //   email: "student@gmail.com",
    //   password: hashedPassword,
    //   role: "student",
    //   isVerified: true
    // });

    //  Rooms
    const rooms = await Room.insertMany([
      {
        roomNumber: "101",
        type: "Single",
        capacity: 1,
        occupants: []
      },
      {
        roomNumber: "102",
        type: "Double",
        capacity: 2,
        occupants: []
      },
      {
        roomNumber: "103",
        type: "Triple",
        capacity: 3,
        occupants: []
      }
    ]);

    console.log("Data Seeded Successfully ✅");

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};


// Run function
seedData();

