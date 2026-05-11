// middleware/roleMiddleware.js

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ status: 403, success: false, message: "Admin access only" });
  }
  next();
};

exports.isWarden = (req, res, next) => {
  if (req.user.role !== "warden") {
    return res.status(403).json({ status: 403, success: false, message: "Warden access only" });
  }
  next();
};

exports.isWardenOrAdmin = (req, res, next) => {
  if (req.user.role !== "warden" && req.user.role !== "admin") {
    return res.status(403).json({ status: 403, success: false, message: "Access denied" });
  }
  next();
};