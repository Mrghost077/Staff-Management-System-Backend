import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";
import reliefAssignmentModel from "../models/reliefAssignmentModel.js";
import userModel from "../models/userModel.js";

// Helper function to format date without timezone
const formatDateLocal = (dateString) => {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Attendance Stats
export const getAttendanceStats = async (req, res) => {
  try {
    const { filterDate } = req.query;
    let matchStage = {};
    if (filterDate) {
      matchStage = { date: filterDate };
    }

    const attendanceData = await attendanceModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "leave"] },
                    { $eq: ["$status", "absent"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
        },
      },
    ]);

    const rawAttendanceList = await attendanceModel
      .find(matchStage)
      .sort({ date: -1 })
      .lean();

    const attendanceList = rawAttendanceList.map((item) => ({
      teacher: item.teacherName || "Unknown",
      date: item.date,
      status: item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : "Unknown",
    }));

    const totalDocs = rawAttendanceList.length;
    const totalPresent = attendanceData.reduce(
      (acc, day) => acc + day.present,
      0
    );
    const totalLate = attendanceData.reduce((acc, day) => acc + day.late, 0);
    const totalAbsent = attendanceData.reduce(
      (acc, day) => acc + day.absent,
      0
    );
    const averageAttendance =
      totalDocs > 0
        ? Math.round(((totalPresent + totalLate) / totalDocs) * 100) + "%"
        : "0%";

    res.json({
      success: true,
      summary: { averageAttendance, totalPresent, totalLate, totalAbsent },
      attendanceList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave Stats
export const getLeaveStats = async (req, res) => {
  try {
    const { filterDate } = req.query;
    let matchStage = {};

    if (filterDate) {
      const start = new Date(filterDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filterDate);
      end.setHours(23, 59, 59, 999);

      matchStage = {
        startDate: { $gte: start, $lte: end },
      };
    }

    const distributionData = await leaveModel.aggregate([
      { $match: matchStage },
      { $group: { _id: "$leaveType", count: { $sum: 1 } } },
    ]);

    const colors = {
      "Sick Leave": "#EF4444",
      "Casual Leave": "#3B82F6",
      "Duty Leave": "#10B981",
      Unpaid: "#6B7280",
      "Emergency Leave": "#F59E0B",
      "Medical Leave": "#EC4899",
    };

    const distribution = distributionData.map((item) => ({
      name: item._id,
      value: item.count,
      color: colors[item._id] || "#8B5CF6",
    }));

    const recentLeaves = await leaveModel
      .find(matchStage)
      .sort({ appliedAt: -1 })
      .lean();

    const recent = await Promise.all(
      recentLeaves.map(async (leave) => {
        let teacherName = "Unknown";
        const teacherId = leave.userId || leave.teacherId;
        if (teacherId) {
          const user = await userModel.findById(teacherId);
          if (user) teacherName = user.name;
        }
        return {
          id: leave._id,
          teacher: teacherName,
          type: leave.leaveType,
          date: formatDateLocal(leave.startDate),
          status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
        };
      })
    );

    res.json({ success: true, distribution, recent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Relief Stats
export const getReliefStats = async (req, res) => {
  try {
    const { filterDate } = req.query;
    let query = {};

    if (filterDate) {
      const start = new Date(filterDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filterDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const assignments = await reliefAssignmentModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate("originalTeacher", "name")
      .populate("reliefTeacher", "name")
      .populate({
        path: "attendance",
        select: "date",
      });

    const reliefData = assignments.map((a) => ({
      id: a._id,

      date: a.attendance?.date || formatDateLocal(a.createdAt),
      absent: a.originalTeacher?.name || "Unknown",
      relief: a.reliefTeacher?.name || "UNASSIGNED",
      subject: a.subject,
      class: a.grade,
    }));

    res.json({ success: true, reliefData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
