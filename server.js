// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const feeRoutes = require("./routes/feeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const attendanceRoutes =  require("./routes/attendanceRoutes");
const roomAllocationRoutes = require("./routes/roomAllocationRoutes");
const dashboardRoutes =  require("./routes/dashboardRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const disciplineRoutes = require("./routes/disciplineRoutes");
const roomChangeRoutes = require("./routes/roomChangeRoutes");

const app = express();

const cookieParser = require("cookie-parser");
connectDB();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS configured for frontend with credentials support
app.use(cors({
<<<<<<< Updated upstream
  origin: "https://smart-hostel-management-frontend-mu.vercel.app",
=======
  origin: allowedOrigins,
>>>>>>> Stashed changes
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/rooms",roomRoutes);
app.use("/api/complaints",complaintRoutes );
app.use("/api/fees",feeRoutes);
app.use("/api/leaves",leaveRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/room-allocation",roomAllocationRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/discipline", disciplineRoutes);
app.use("/api/room-change", roomChangeRoutes);

<<<<<<< Updated upstream
app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
=======
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
>>>>>>> Stashed changes
