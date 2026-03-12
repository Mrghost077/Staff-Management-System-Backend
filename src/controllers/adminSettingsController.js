import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import sendEmail from "../config/nodemailer.js";
import { v2 as cloudinary } from "cloudinary";

// GET ADMIN PROFILE
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.userId).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, UserData: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminAvatar = async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.userId;

    let avatarUrl = "";

    if (image && image.trim() !== "") {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "admin_avatars",
      });
      avatarUrl = uploadResponse.secure_url;
    } else {
      avatarUrl = "";
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      avatar: avatarUrl,
      message:
        avatarUrl === ""
          ? "Avatar removed successfully"
          : "Avatar updated successfully",
      UserData: updatedAdmin,
    });
  } catch (error) {
    console.error("Avatar Update Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during avatar update" });
  }
};

// UPDATE ADMIN PROFILE 
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phoneNum, address, currentPassword, password } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    let updateData = { name, phoneNum, address };
    const isPasswordChanged = password && password.trim() !== "";

    if (isPasswordChanged) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Current password is required to set a new one",
          });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    // Email logic 
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const signinUrl = `${frontendUrl}/signin`;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: updatedAdmin.email,
      subject: isPasswordChanged
        ? "Security Alert: Password Reset Successfully"
        : "Success: Profile Settings Updated",
      html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; color: #334155; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        
        <div style="background-color: ${isPasswordChanged ? "#dc2626" : "#4338ca"}; padding: 45px 20px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 50px; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
                    Admin Notification
                </span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
                ${isPasswordChanged ? "Password Reset <br/> Confirmed" : "Profile Settings <br/> Updated"}
            </h1>
        </div>

        <div style="padding: 40px 35px; background-color: #ffffff;">
            <p style="font-size: 17px; margin-top: 0; color: #1e293b;">Hi <b>${updatedAdmin.name}</b>,</p>
            
            <p style="font-size: 15px; line-height: 1.6; color: #64748b;">
                ${
                  isPasswordChanged
                    ? `This email confirms that your <b>account password</b> has been changed successfully. Your account security is our main priority.`
                    : `This is to inform you that your <b>admin profile details</b> have been successfully updated on the system dashboard.`
                }
            </p>

            <div style="margin: 30px 0; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #f1f5f9;">
                    <span style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Updated Account Summary</span>
                </div>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 15px 20px; color: #64748b; border-bottom: 1px solid #f1f5f9;"><b>Full Name</b></td>
                        <td style="padding: 15px 20px; color: #1e293b; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${updatedAdmin.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 20px; color: #64748b; border-bottom: 1px solid #f1f5f9;"><b>Email Address</b></td>
                        <td style="padding: 15px 20px; color: #1e293b; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${updatedAdmin.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 20px; color: #64748b; border-bottom: 1px solid #f1f5f9;"><b>Phone Number</b></td>
                        <td style="padding: 15px 20px; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${updatedAdmin.phoneNum || "Not Set"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 20px; color: #64748b;"><b>Address</b></td>
                        <td style="padding: 15px 20px; color: #1e293b;">${updatedAdmin.address || "Not Set"}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.FRONTEND_URL}/signin" style="background-color: #0f172a; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">
                    Go to Dashboard
                </a>
            </div>

            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: ${isPasswordChanged ? "#ef4444" : "#64748b"}; line-height: 1.5;">
                    ${
                      isPasswordChanged
                        ? `<b>Warning:</b> If you did not reset your password, please take immediate action by contacting the IT department.`
                        : `If you did not authorize this profile update, please check your account security settings.`
                    }
                </p>
            </div>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                &copy; ${new Date().getFullYear()} TeachGrid Admin Services.
            </p>
            <p style="margin: 8px 0; font-size: 11px; color: #cbd5e0;">
                This is a system-generated security email. Please do not reply.
            </p>
        </div>
    </div>
  `,
    };
    await sendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: isPasswordChanged
        ? "Profile and Password updated!"
        : "Profile updated!",
      UserData: updatedAdmin,
    });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL TEACHERS
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.status(200).json({ success: true, teachers: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE A TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Teacher account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
