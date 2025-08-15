// utils/otp.js
const crypto = require('crypto');

const otpStore = new Map(); // In-memory store: email -> { otp, expiresAt }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

function saveOTP(email, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  otpStore.set(email, { otp, expiresAt });
}

function verifyOTP(email, otp) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  if (record.otp === otp) {
    otpStore.delete(email);
    return true;
  }
  return false;
}

module.exports = { generateOTP, saveOTP, verifyOTP };
