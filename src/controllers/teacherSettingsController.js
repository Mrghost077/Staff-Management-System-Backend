import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// reusable email template function
const getEmailTemplate = (user, isPasswordChanged) => {
  const primaryColor = isPasswordChanged ? "#e11d48" : "#4f46e5"; 
  const bgColor = isPasswordChanged ? "#fff1f2" : "#f5f3ff";
  const statusLabel = isPasswordChanged ? "Security Alert" : "System Update";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1f2937; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
      
      <div style="background-color: ${primaryColor}; padding: 35px 20px; text-align: center;">
        <div style="margin-bottom: 12px;">
          <span style="background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 5px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
            ${statusLabel}
          </span>
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; line-height: 1.3;">
          ${isPasswordChanged ? 'Password Changed <br/> Successfully' : 'Teacher Profile <br/> Updated Successfully'}
        </h1>
      </div>

      <div style="padding: 30px 40px;">
        <p style="margin-top: 0; font-size: 16px; color: #111827;">Hello <b>${user.name}</b>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 25px;">
          ${isPasswordChanged 
            ? `Your account password has been updated. If you did not make this change, please take action immediately.` 
            : `Your profile details have been successfully updated in the TeachGrid system. Please review the summary below.`}
        </p>

        <div style="background-color: ${bgColor}; border-radius: 12px; padding: 20px; border: 1px solid rgba(0,0,0,0.03);">
          <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: ${primaryColor}; margin-bottom: 15px; font-weight: 700;">
            Account Summary
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #6b7280; width: 40%; vertical-align: top; border-bottom: 1px solid rgba(0,0,0,0.05);">Full Name</td>
              <td style="padding: 10px 0; font-size: 13px; color: #111827; font-weight: 600; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.05); word-wrap: break-word;">${user.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #6b7280; width: 40%; vertical-align: top; border-bottom: 1px solid rgba(0,0,0,0.05);">Email</td>
              <td style="padding: 10px 0; font-size: 13px; color: #111827; font-weight: 600; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.05); word-wrap: break-word;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #6b7280; width: 40%; vertical-align: top;">Contact</td>
              <td style="padding: 10px 0; font-size: 13px; color: #111827; font-weight: 600; text-align: right; word-wrap: break-word;">${user.phoneNum || 'Not Provided'}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/signin" style="background-color: #111827; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Login to Dashboard
          </a>
        </div>

        <div style="border-top: 1px dotted #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            This is an automated notification. If you have any questions, please contact TeachGrid Support.
          </p>
        </div>
      </div>

      <div style="background-color: #f9fafb; padding: 25px; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          &copy; ${new Date().getFullYear()} TeachGrid
        </p>
      </div>
    </div>
  `;
};

// Fetch Teacher Profile
export const getTeacherSettings = async (req, res) => {
  try {
    const teacher = await User.findById(req.userId).select("-password");
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Teacher Profile
export const updateTeacherSettings = async (req, res) => {
  try {
    const { name, phoneNum, address } = req.body;
    const updatedTeacher = await User.findByIdAndUpdate(
      req.userId,
      { name, phoneNum, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedTeacher) {
      return res.status(404).json({ success: false, message: "Update failed" });
    }

    try {
      await transporter.sendMail({
        from: `"TeachGrid Support" <${process.env.SENDER_EMAIL}>`,
        to: updatedTeacher.email,
        subject: "Success: Profile Settings Updated",
        html: getEmailTemplate(updatedTeacher, false),
      });
      console.log("Profile update email sent to:", updatedTeacher.email);
    } catch (err) {
      console.error("Email Error:", err.message);
    }

    res.json({ success: true, message: "Profile updated successfully", data: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Avatar 
export const updateAvatar = async (req, res) => {
  try {
    const { image } = req.body;
    const teacherId = req.userId;
    let avatarUrl = "";

    if (image && image !== "") {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "teachgrid_avatars",
        transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
      });
      avatarUrl = uploadResponse.secure_url;
    }

    await User.findByIdAndUpdate(teacherId, { avatar: avatarUrl }, { new: true });

    res.json({
      success: true,
      message: avatarUrl === "" ? "Profile picture removed!" : "Profile picture updated!",
      avatar: avatarUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Teacher Password
export const resetTeacherPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const teacherId = req.userId;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long!" });
    }

    const teacher = await User.findById(teacherId).select("+password");
    if (!teacher) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, teacher.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Current password does not match!" });

    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(newPassword, salt);
    await teacher.save();

    // Send Email on Password Reset
    try {
      await transporter.sendMail({
        from: `"TeachGrid Security" <${process.env.SENDER_EMAIL}>`,
        to: teacher.email,
        subject: "Security Alert: Your Password was Changed",
        html: getEmailTemplate(teacher, true),
      });
    } catch (err) { console.log("Email error:", err); }

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};