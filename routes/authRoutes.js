// routes/authRoutes.js
const router = require("express").Router();
const { login } = require("../controllers/authController");
const { createUser } = require("../controllers/userController");

router.post("/signup", createUser);
router.post("/login", login);

module.exports = router;