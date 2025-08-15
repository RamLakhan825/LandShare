// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any email provider
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // email password or app password
  },
});

async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP for Registration',
    text: `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };
