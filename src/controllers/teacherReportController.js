import Attendance from "../models/attendanceModel.js";
import Leave from "../models/leaveModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";

export const getTeacherPersonalReports = async (req, res) => {
  try {
    const loggedInTeacherId = req.userId;

    const [attendance, leaves, relief] = await Promise.all([
      Attendance.find({ teacher: loggedInTeacherId }).sort({ date: -1 }),

      Leave.find({ teacherId: loggedInTeacherId }).sort({ startDate: -1 }),

      ReliefAssignment.find({ reliefTeacher: loggedInTeacherId }).sort({
        createdAt: -1,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: { attendance, leaves, relief },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
