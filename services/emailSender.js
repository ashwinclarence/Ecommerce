const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

function sendOtpMail(email, otp) {
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Verification code from CleatCraft",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">CleatCraft Verification Code</h2>
        <p>Please use the verification code below to sign in:</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; text-align: center;">
          <p style="font-size: 24px; font-weight: bold; color: #555; margin: 0;">${otp}</p>
        </div>
        <p>If you didn't request this, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ccc;" />
        <p style="font-size: 12px; color: #999;">&copy; 2024 CleatCraft. All rights reserved.</p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(`Error occurred while sending mail: ${err}`);
    } else {
      console.log("Email sent successfully");
    }
  });
}

function sendWelcomeMail(email, customerName) {
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Welcome to CleatCraft!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #ff6600;">Welcome to CleatCraft, ${customerName}!</h1>
        <p>We're excited to have you on board. Here at CleatCraft, we're passionate about providing the best cleats and accessories for all your sporting needs.</p>
        <p>As a new member, you now have access to:</p>
        <ul>
          <li>Exclusive discounts and offers</li>
          <li>Personalized product recommendations</li>
          <li>Early access to new arrivals</li>
          <li>Expert advice and tips</li>
        </ul>
        <p>To get started, visit our <a href="https://www.cleatcraft.shop" style="color: #ff6600; text-decoration: none;">website</a> and explore our latest collections.</p>
        <hr style="border: none; border-top: 1px solid #ccc;" />
        <p style="font-size: 12px; color: #999;">&copy; 2024 CleatCraft. All rights reserved.</p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(`Error occurred while sending mail: ${err}`);
    } else {
      console.log("Welcome email sent successfully");
    }
  });
}

module.exports = { sendOtpMail, sendWelcomeMail };
