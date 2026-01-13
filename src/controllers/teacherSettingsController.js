import User from "../models/userModel.js";

// Fetch teacher profile
export const getTeacherSettings = async (req, res) => {
  try {
    const teacher = await User.findById(req.userId).select("-password");
    if (!teacher) {
      return res.json({ success: false, message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update teacher profile
export const updateTeacherSettings = async (req, res) => {
  try {
    const { name, phoneNum, address } = req.body;

    const updatedTeacher = await User.findByIdAndUpdate(
      req.userId,
      { name, phoneNum, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedTeacher) {
      return res.json({ success: false, message: "Update failed" });
    }

    // Send success response
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
