// const express = require("express");
// const router = express.Router();
// const { register, login, googleLogin } = require("../controllers/authController");

// router.post("/register", register);
// router.post("/login", login);
// router.post("/google-login", googleLogin);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { register, login, googleLogin } = require("../controllers/authController");
const { generateOTP, saveOTP, verifyOTP } = require("../utils/otp");
const { sendOTPEmail } = require("../utils/email");
const User = require("../models/User"); // Sequelize/Mongoose model

// Standard auth
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

// OTP routes
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ msg: "Email already registered" });

    const otp = generateOTP();
    saveOTP(email, otp);
    await sendOTPEmail(email, otp);

    res.json({ success: true, msg: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const valid = verifyOTP(email, otp);
  if (!valid) return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });

  res.json({ success: true, msg: "OTP verified" });
});

module.exports = router;
