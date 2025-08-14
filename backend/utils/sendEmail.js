const nodemailer = require("nodemailer");

async function sendApprovalEmail(to, subject, title, message, footer) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
      
      <!-- Title -->
      <h2 style="color: ${title.includes("Declined") ? "#E74C3C" : "#4CAF50"}; text-align: center;">
        ${title}
      </h2>

      <!-- Main Message -->
      <div style="font-size: 15px; color: #333; line-height: 1.6; margin-top: 15px;">
        ${message}
      </div>

      <!-- Footer -->
      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        ${footer}
      </p>

      <!-- Divider -->
      <hr style="margin: 20px 0;">

      <!-- Disclaimer -->
      <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated message from LandShare. Please do not reply.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LandShare Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  });

  console.log(`Email sent to ${to} with subject "${subject}"`);
}

module.exports = sendApprovalEmail;
