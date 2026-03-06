import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const router = express.Router();

// Temporary in-memory store for reset tokens (for simplicity)
const resetTokens = {};

// --- Forgot Password ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    // Generate a reset token
    const token = crypto.randomBytes(20).toString("hex");
    resetTokens[email] = token;

    // Create password reset link
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Setup Nodemailer using Gmail service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Jean-Zey" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="background-color:#000;color:#fff;padding:10px 20px;text-decoration:none;">Reset Password</a>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Password reset link sent!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
});

// --- Reset Password ---
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const email = Object.keys(resetTokens).find((key) => resetTokens[key] === token);
    if (!email) return res.json({ success: false, message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    delete resetTokens[email];
    res.json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error resetting password" });
  }
});

export default router;
