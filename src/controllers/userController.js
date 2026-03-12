import userModel from "../models/userModel.js";

//Controller to get User Info
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found!" });
    }

    return res.json({
      success: true,
      UserData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
        phoneNum: user.phoneNum,
        role: user.role,
        avatar: user.avatar,
        subject: user.subject,
      },
    });
  } catch (error) {
    return res.json({success: false, message: error.message});
  }
}