const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// POST /contact/send
router.post("/send", async (req, res) => {
  try {
    const { name, contact, message, email } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL, // your admin Gmail
        pass: process.env.ADMIN_PASS,  // app password from Gmail
      },
    });

    // Email to admin
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      replyTo: email, // so admin can reply to user directly
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Us Message - LandShare",
      html: `
        <h3>Contact Form Submission</h3>
        <p><b>Name:</b> ${name || "N/A"}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Contact:</b> ${contact || "N/A"}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Message sent to admin" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
