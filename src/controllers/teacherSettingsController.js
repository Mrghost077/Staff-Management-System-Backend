import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import sendEmail from "../config/sendEmail.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// reusable email template function
const getEmailTemplate = (user, isPasswordChanged) => {
  const primaryColor = isPasswordChanged ? "#e11d48" : "#4f46e5"; 
  const bgColor = isPasswordChanged ? "#fff1f2" : "#f5f3ff";
  const statusLabel = isPasswordChanged ? "Security Alert" : "System Update";

  return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isPasswordChanged ? 'Password Changed Successfully' : 'Profile Updated - TeachGrid'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9fc; line-height: 1.6; color: #334155;">
    
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc); padding: 40px 30px; text-align: center;">
                <div style="margin-bottom: 16px;">
                    <span style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                        ${statusLabel}
                    </span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600; line-height: 1.4; letter-spacing: -0.025em;">
                    ${isPasswordChanged ? 'Password Changed Successfully' : 'Teacher Profile Updated'}
                </h1>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <p style="margin-top: 0; font-size: 16px; color: #0f172a; line-height: 1.7;">
                    Hello <strong>${user.name}</strong>,
                </p>
                
                <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 30px;">
                    ${isPasswordChanged 
                      ? 'Your account password has been updated successfully. If you did not make this change, please take action immediately by contacting support.' 
                      : 'Your profile details have been successfully updated in the TeachGrid system for H/Meegasara Maha Vidyalaya. Please review the summary below.'}
                </p>

                <!-- Account Summary Card -->
                <div style="background: ${bgColor}; border-radius: 12px; padding: 28px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 30px;">
                    <h3 style="margin: 0 0 24px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: ${primaryColor}; font-weight: 600;">
                        Account Summary
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 120px 1fr; gap: 20px; align-items: center;">
                        <span style="color: #64748b; font-weight: 500; font-size: 15px;">Full Name</span>
                        <div style="color: #1e293b; font-weight: 600; font-size: 15px; text-align: right; word-break: break-word;">
                            ${user.name}
                        </div>
                        
                        <span style="color: #64748b; font-weight: 500; font-size: 15px;">Email</span>
                        <div style="color: #1e293b; font-weight: 600; font-size: 15px; text-align: right; word-break: break-all;">
                            ${user.email}
                        </div>
                        
                        <span style="color: #64748b; font-weight: 500; font-size: 15px;">Contact</span>
                        <div style="color: #1e293b; font-weight: 600; font-size: 15px; text-align: right; word-break: break-word;">
                            ${user.phoneNum || 'Not Provided'}
                        </div>
                    </div>
                </div>

                <!-- Security Notice for Password Change -->
                ${isPasswordChanged ? `
                <div style="background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                    <p style="color: #92400e; font-size: 15px; margin: 0; line-height: 1.6; font-weight: 500;">
                        <strong>🔒 Security Notice:</strong> If this password change was not initiated by you, please contact support immediately at <a href="mailto:support@teachgrid.com" style="color: #d97706;">support@teachgrid.com</a>.
                    </p>
                </div>
                ` : ''}

                <!-- Support -->
                <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e2e8f0; padding-bottom: 20px;">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 12px; line-height: 1.5;">
                        Questions about this update? Contact our support team:
                    </p>
                    <a href="mailto:support@teachgrid.com" style="color: #1d4ed8; font-weight: 600; text-decoration: none; font-size: 16px; letter-spacing: -0.025em;">
                        support@teachgrid.com
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0 0 4px; line-height: 1.5;">
                    © 2026 TeachGrid - H/Meegasara Maha Vidyalaya
                </p>
                <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.4;">
                    This is an automated notification from the TeachGrid system.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
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
      await sendEmail({
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
      await sendEmail({
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