import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import sendEmail from "../config/nodemailer.js";

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

// UPDATE ADMIN PROFILE
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phoneNum, address, password } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    let updateData = { name, phoneNum, address };
    const isPasswordChanged = password && password.trim() !== "";

    if (isPasswordChanged) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const signinUrl = `${frontendUrl}/signin`;

    const mailOptions = {
      from: '"TeachGrid Admin Services" <admin@teachgrid.com>',
      to: updatedAdmin.email,
      subject: "Profile Updated Successfully - TeachGrid",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #f0f0f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            
            <div style="background-color: #5d51ff; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Profile Update Alert</h1>
            </div>

            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #555; margin-top: 0;">Dear <b>${
                  updatedAdmin.name
                }</b>,</p>
                <p style="font-size: 15px; color: #666; line-height: 1.6;">Your account profile settings have been successfully updated. Review your details below:</p>

                <div style="background-color: #f9faff; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #edf2f7;">
                    <p style="margin: 8px 0; font-size: 14px;"><b>Full Name:</b> ${
                      updatedAdmin.name
                    }</p>
                    <p style="margin: 8px 0; font-size: 14px;"><b>Phone:</b> ${
                      updatedAdmin.phoneNum || "Not Set"
                    }</p>
                    <p style="margin: 8px 0; font-size: 14px;"><b>Address:</b> ${
                      updatedAdmin.address || "Not Set"
                    }</p>
                    <p style="margin: 8px 0; font-size: 14px;"><b>Email:</b> ${
                      updatedAdmin.email
                    }</p>
                </div>

                ${
                  isPasswordChanged
                    ? `
                <div style="background-color: #fff5f5; border: 2px solid #feb2b2; border-radius: 12px; padding: 20px; text-align: center; margin-top: 25px;">
                    <p style="margin: 0 0 10px 0; color: #c53030; font-weight: bold; font-size: 15px; text-transform: uppercase;">New Password Security Update</p>
                    <p style="margin: 0 0 15px 0; font-size: 13px; color: #742a2a;">Your password was changed. Use this for your next login:</p>
                    <div style="background: white; padding: 12px 20px; border-radius: 8px; display: inline-block; font-family: 'Courier New', monospace; font-size: 22px; color: #c53030; font-weight: bold; letter-spacing: 2px; border: 1px solid #feb2b2;">
                        ${password}
                    </div>
                </div>
                `
                    : `
                <div style="background-color: #f0fff4; border-radius: 12px; padding: 20px; border: 1px solid #c6f6d5; margin-top: 25px;">
                    <p style="margin: 0; color: #2f855a; font-size: 14px; line-height: 1.5;">
                        <b>Security Note:</b> Password was not changed during this update. Please continue to use your <b>existing password</b> to access the dashboard.
                    </p>
                </div>
                `
                }

                <div style="text-align: center; margin-top: 35px;">
                    <a href="${signinUrl}" style="background-color: #5d51ff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(93, 81, 255, 0.3);">Go to Dashboard</a>
                </div>

                <p style="font-size: 12px; color: #a0aec0; margin-top: 40px; text-align: center; line-height: 1.6;">
                    If you did not perform this action, please secure your account by contacting support or resetting your password immediately.
                </p>
            </div>

            <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
                <p style="margin: 0; font-size: 11px; color: #718096;">&copy; ${new Date().getFullYear()} TeachGrid Admin Services. All rights reserved.</p>
            </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Profile updated and notification email sent!",
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

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNum, address, password } = req.body;

    let updateData = { name, email, phoneNum, address };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedTeacher = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedTeacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const frontendUrl = "http://localhost:5173";
    const signinUrl = `${frontendUrl}/signin`;

    const mailOptions = {
      from: '"TeachGrid Admin" <admin@teachgrid.com>',
      to: updatedTeacher.email,
      subject: "⚠️ Security Alert: Your TeachGrid Account Details Updated",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
            <p style="font-size: 16px; color: #555;">Dear <b>${
              updatedTeacher.name
            }</b>,</p>
            <p style="font-size: 15px; color: #555;">This is an automated message to inform you that your profile details have been updated in the <b>TeachGrid Management System</b>.</p>

            <div style="background-color: #f8faff; border: 1px solid #eef2f7; border-radius: 12px; padding: 25px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="height: 40px;">
                        <td style="width: 35px; vertical-align: middle;">📩</td>
                        <td style="font-size: 15px;"><b>Email:</b> ${
                          updatedTeacher.email
                        }</td>
                    </tr>
                    <tr style="height: 40px;">
                        <td style="vertical-align: middle;">📞</td>
                        <td style="font-size: 15px;"><b>Phone:</b> ${
                          updatedTeacher.phoneNum || "Not Provided"
                        }</td>
                    </tr>
                    <tr style="height: 40px;">
                        <td style="vertical-align: middle;">📍</td>
                        <td style="font-size: 15px;"><b>Address:</b> ${
                          updatedTeacher.address || "Not Provided"
                        }</td>
                    </tr>
                </table>
            </div>

            <div style="background-color: #fff5f5; border-left: 5px solid #ff5a5f; border-radius: 4px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #c53030; font-size: 16px; letter-spacing: 0.5px; text-transform: uppercase;">
                    SECURITY NOTICE: 
                </h3>
                
                ${
                  password && password.trim() !== ""
                    ? ` <span style="font-weight: normal; color: #4a5568; text-transform: none;">Your login password has been reset by the administrator.</span>
                    <div style="margin-top: 15px; padding: 12px; background: #fff; border: 1px dashed #feb2b2; display: inline-block; border-radius: 6px;">
                    
                        <span style="font-size: 14px; color: #718096;">Please contact the administrator to receive your new login credentials.</span>
                       </div>`
                    : `<p style="margin: 5px 0 0 0; font-size: 14px; color: #4a5568;">Please use your <b>existing password</b> for future logins.</p>`
                }
            </div>

            <p style="font-size: 13px; color: #718096; margin-top: 30px; text-align: center;">
                If you did not authorize these changes, please contact the TeachGrid support team immediately.
            </p>

            <div style="text-align: center; margin-top: 25px; padding-bottom: 40px; border-bottom: 1px solid #eee;">
                <a href="${signinUrl}" style="background-color: #0a035f; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 10px rgba(10, 3, 95, 0.2);">Login</a>
            </div>

            <p style="text-align: center; font-size: 11px; color: #a0aec0; margin-top: 20px;">
                &copy; ${new Date().getFullYear()} TeachGrid. This is a system-generated security notification.
            </p>
        </div>
    `,
    };

    await sendEmail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Teacher updated and confirmation email sent!",
      teacher: updatedTeacher,
    });
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

// UPDATE TEACHER PASSWORD
export const updateTeacherPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const teacher = await User.findById(id).select("email");
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL;
    const signinUrl = `${frontendUrl}/signin`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    const mailOptions = {
      from: '"TeachGrid Admin" <admin@teachgrid.com>',
      to: teacher.email,
      subject: "Your Password Has Been Reset",
      html: `
                <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eee; max-width: 500px; border-radius: 10px; text-align: center; margin: auto;">
                    <h3 style="color: #2c3e50;">Security Update</h3>
                    <p>The administrator has reset your account password.</p>
                    <div style="background: #f9f9f9; padding: 15px; border: 1px solid #eee; margin: 20px 0; border-radius: 8px;">
                        <p style="color: #e74c3c; font-size: 16px; font-weight: bold; margin: 5px 0;">Please contact the administrator for your new credentials.</p>
                    </div>
                    <p>Please use this credential to log in to your account.</p>
                    <a href="${signinUrl}" style="background-color: #0a035f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 10px;">Login Now</a>
                </div>
            `,
    };

    await sendEmail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Password updated and email sent!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
