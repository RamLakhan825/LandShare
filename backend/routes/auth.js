const express = require('express');
const router = express.Router();
const { generateOTP, saveOTP, verifyOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const User = require('../models/User'); // your Sequelize/Mongoose user model

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user already exists (optional)
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ msg: 'Email already registered' });

    const otp = generateOTP();
    saveOTP(email, otp);
    await sendOTPEmail(email, otp);

    res.json({ success: true, msg: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  const valid = verifyOTP(email, otp);
  if (!valid) return res.status(400).json({ success: false, msg: 'Invalid or expired OTP' });

  res.json({ success: true, msg: 'OTP verified' });
});

module.exports = router;
