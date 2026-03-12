import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";


// TODAY ATTENDANCE SUMMARY
export const getTodayAttendanceSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // Get all active teachers
    const teachers = await userModel
      .find({ role: "teacher" })
      .select("_id");

    const teacherIds = teachers.map(t => t._id);

    // Attendance counts
    const [present, late, leave, unmarked] = await Promise.all([
      attendanceModel.countDocuments({
        date: todayStr,
        status: "present",
        teacher: { $in: teacherIds }
      }),
      attendanceModel.countDocuments({
        date: todayStr,
        status: "late",
        teacher: { $in: teacherIds }
      }),
      attendanceModel.countDocuments({
        date: todayStr,
        status: "leave",
        teacher: { $in: teacherIds }
      }),
      attendanceModel.countDocuments({
        date: todayStr,
        status: "unmarked",
        teacher: { $in: teacherIds }
      })
    ]);

    // Present = present + late
    const presentToday = present + late;

    //Pending leave count 
    const pendingLeaveCount = await leaveModel.countDocuments({
      status: "Pending",
      teacherId: { $in: teacherIds }
    });

    // Pending relief assignments for today
    const pendingReliefs = await ReliefAssignment.find({
      status: "pending"
    }).populate({
      path: "attendance",
      match: { date: todayStr },
      select: "_id date"
    });

    const todayPendingReliefCount = pendingReliefs.filter(
      r => r.attendance !== null
    ).length;

    res.status(200).json({
      success: true,
      date: todayStr,
      totalTeachers: teacherIds.length,
      attendanceSummary: {
        present: presentToday,
        leave,
        unmarked
      },
      pendingLeaveCount,
      pendingReliefCount: todayPendingReliefCount
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// TODAY TEACHER AVAILABILITY
export const getTodayTeacherAvailability = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const teachers = await userModel
      .find({ role: "teacher" })
      .select("name _id");

    const teacherIds = teachers.map(t => t._id);

    const attendanceRecords = await attendanceModel
      .find({
        date: todayStr,
        teacher: { $in: teacherIds }
      })
      .select("teacher status -_id");

    const availability = teachers.map(teacher => {
      const record = attendanceRecords.find(
        att => String(att.teacher) === String(teacher._id)
      );

      return {
        teacherName: teacher.name,
        status: record ? record.status : "unmarked"
      };
    });

    res.status(200).json({
      success: true,
      date: todayStr,
      teachers: availability
    });
  } catch (error) {
    console.error("Today availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
