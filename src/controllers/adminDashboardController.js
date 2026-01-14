import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js"; // ✅ Import relief assignment model

/**
 * ================================
 * Admin Dashboard – Today Summary
 * ================================
 */
export const getTodayAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // ✅ Only active teachers
    const activeTeachers = await userModel.find({ role: "teacher" }).select("_id");
    const activeTeacherIds = activeTeachers.map((t) => t._id);

    // Attendance counts (only active teachers)
    const [presentCount, lateCount, leave, unmarked] = await Promise.all([
      attendanceModel.countDocuments({ date: todayStr, status: "present", teacher: { $in: activeTeacherIds } }),
      attendanceModel.countDocuments({ date: todayStr, status: "late", teacher: { $in: activeTeacherIds } }),
      attendanceModel.countDocuments({ date: todayStr, status: "leave", teacher: { $in: activeTeacherIds } }),
      attendanceModel.countDocuments({ date: todayStr, status: "unmarked", teacher: { $in: activeTeacherIds } }),
    ]);

    const presentToday = presentCount + lateCount; // ✅ Present + Late

    // Pending relief count (aggregate via attendance)
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const pendingReliefAggregate = await ReliefAssignment.aggregate([
      { $match: { status: "pending", originalTeacher: { $in: activeTeacherIds } } },
      {
        $lookup: {
          from: "attendances",
          localField: "attendance",
          foreignField: "_id",
          as: "attendanceInfo"
        }
      },
      { $unwind: "$attendanceInfo" },
      { $match: { "attendanceInfo.date": { $gte: startOfDay, $lte: endOfDay } } },
      { $count: "pendingReliefCount" }
    ]);

    const pendingReliefCount = pendingReliefAggregate[0]?.pendingReliefCount || 0;

    // Pending leave count: only active teachers
    const pendingLeaveCount = await leaveModel.countDocuments({
      status: "Pending",
      $or: [
        { teacher: { $in: activeTeacherIds } },
        { teacher: { $exists: false } } // legacy leaves without teacher
      ],
    });

    res.status(200).json({
      success: true,
      date: todayStr,
      totalTeachers: activeTeacherIds.length,
      attendanceSummary: { present: presentToday, leave, unmarked, pendingReliefCount },
      pendingLeaveCount,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ===================================
 * Teacher Availability – Today
 * ===================================
 */
export const getTodayTeacherAvailability = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // ✅ Only active teachers
    const teachers = await userModel.find({ role: "teacher" }).select("name _id");
    const activeTeacherIds = teachers.map((t) => t._id);

    // Today's attendance for active teachers
    const attendanceRecords = await attendanceModel
      .find({ date: todayStr, teacher: { $in: activeTeacherIds } })
      .select("teacher status -_id");

    const availability = teachers.map((teacher) => {
      const record = attendanceRecords.find(att => String(att.teacher) === String(teacher._id));
      return {
        teacherName: teacher.name,
        status: record ? record.status : "unmarked"
      };
    });

    res.status(200).json({ success: true, date: todayStr, teachers: availability });
  } catch (error) {
    console.error("Today availability error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ===================================
 * Teacher Availability – By Date
 * ===================================
 */
export const getTeacherAvailabilityByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });

    const teachers = await userModel.find({ role: "teacher" }).select("name _id");
    const activeTeacherIds = teachers.map((t) => t._id);

    const attendanceRecords = await attendanceModel
      .find({ date, teacher: { $in: activeTeacherIds } })
      .select("teacher status -_id");

    const availability = teachers.map((teacher) => {
      const record = attendanceRecords.find(att => String(att.teacher) === String(teacher._id));
      return {
        teacherName: teacher.name,
        status: record ? record.status : "unmarked"
      };
    });

    res.status(200).json({ success: true, date, teachers: availability });
  } catch (error) {
    console.error("Availability by date error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
