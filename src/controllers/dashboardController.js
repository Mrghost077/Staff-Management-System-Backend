import Attendance from "../models/attendanceModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";
import Announcement from "../models/announcementModel.js";
import leaveModel from "../models/leaveModel.js";

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.userId; 

    /* Attendance */
    const totalAttendance = await Attendance.countDocuments({
      teacher: teacherId,
    });

    const attendanceCount   = await Attendance.countDocuments({
      teacher: teacherId,
      status: "present",
    });


    /*approved Leaves */
    const approvedLeaves = await leaveModel.countDocuments({
      teacherId: teacherId,
      status: "Approved",
    });

    const totalLeaves = 40; 

    /* Relief Duties */
    const reliefDuties = await ReliefAssignment.countDocuments({
      reliefTeacher: teacherId,
      status: "completed",
    });

    /* Upcoming Relief Duties */
    const upcomingRelief  = await ReliefAssignment.findOne({
      reliefTeacher: teacherId,
      status: "assigned",
    })
      .sort({ createdAt: -1 })
      .populate("attendance");

  
    /* Upcoming Latest Announcement */
    const latestAnnouncement = await Announcement.findOne()
      .sort({ createdAt: -1 });

    res.status(200).json({
      attendanceCount,
      approvedLeaves: `${approvedLeaves} / ${totalLeaves}`,
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
