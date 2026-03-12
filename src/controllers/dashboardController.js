import Attendance from "../models/attendanceModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";
import Announcement from "../models/announcementModel.js";
import leaveModel from "../models/leaveModel.js";

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.userId;

    //Attendance
    const presentCount = await Attendance.countDocuments({
      teacher: teacherId,
      status: "present",
    });

    const lateCount = await Attendance.countDocuments({
      teacher: teacherId,
      status: "late",
    });

    //Approved Leaves
    // Fetch all approved leaves for the teacher
    const approvedLeavesData = await leaveModel.find({
      teacherId,
      status: "Approved",
    });

    // Sum total days from all approved leaves
    const approvedLeaveDays = approvedLeavesData.reduce(
      (sum, leave) => sum + (leave.totalDays || 0),
      0
    );

    const totalLeaves = 41; 

    //Relief Duties 
    const reliefDuties = await ReliefAssignment.countDocuments({
      reliefTeacher: teacherId,
      status: "completed",
    });

    //Upcoming Relief Duty
    const upcomingRelief = await ReliefAssignment.findOne({
      reliefTeacher: teacherId,
      status: "assigned",
    })
      .sort({ createdAt: -1 })
      .populate("attendance");

    //Latest Announcement
    const latestAnnouncement = await Announcement.findOne().sort({ createdAt: -1 });

    //Response
    res.status(200).json({
      presentCount,
      lateCount,
      approvedLeaves: `${approvedLeaveDays} / ${totalLeaves}`, 
      reliefDuties,
      upcomingRelief: upcomingRelief || null,
      latestAnnouncement,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};
