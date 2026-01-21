import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import Absence from "../models/absenceModel.js"; 
import ReliefAssignment from "../models/reliefAssignmentModel.js";
import { createReliefAssignmentsForAbsence } from "./reliefAssignmentController.js";
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

// 1. Get all users who are teachers
export const getTeachers = async (req, res) => {
    try {
        const teachers = await userModel.find({ role: 'teacher' }).select('name email _id subjects');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Initialize attendance for a specific date
export const initAttendance = async (req, res) => {
    try {
        const { date } = req.body; 
        if (!date) return res.status(400).json({ message: "Date is required" });

        // 1. Find teachers
        const teachers = await userModel.find({ role: 'teacher' });

        if (teachers.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "No teachers found to initialize." 
            });
        }

        const operations = teachers.map(t => ({
            updateOne: {
                // filter by 'teacher', not 'userId'
                filter: { teacher: t._id, date: date }, 
                update: {
                    $setOnInsert: {
                        teacher: t._id,
                        teacherName: t.name,
                        date: date,
                        status: 'unmarked',
                        subject:(t.subjects && t.subjects.length > 0) ? t.subjects[0] : ""
                    }
                },
                upsert: true
            }
        }));

        // 2. Execute bulkWrite
        const result = await attendanceModel.bulkWrite(operations);
        
        
        res.json({ success: true, message: `Attendance initialized for ${date}` });

    } catch (error) {
        console.error("Error in initAttendance:", error); 
        res.status(500).json({ success: false, message: error.message });
    }
};
// 3. Get attendance for a specific date
export const getAttendanceByDate = async (req, res) => {
    try {
        const { date, q } = req.query;
        let query = { date };

        let records = await attendanceModel.find(query).lean();

        // Simple search filtering if 'q' is provided
        if (q) {
            records = records.filter(r => r.teacherName.toLowerCase().includes(q.toLowerCase()));
        }

        res.json(records);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update attendance status (Syncs with Absence & Relief models)
export const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, checkIn, checkOut, subject } = req.body;

        // 1. Update the record in the attendance table
        const record = await attendanceModel.findByIdAndUpdate(
            id, 
            { status, checkIn, checkOut, subject }, 
            { new: true }
        );

        if (!record) return res.status(404).json({ message: "Record not found" });

        // 2. SYNC LOGIC
        if (status === 'leave') {
            // A. Update the Absence collection
            await Absence.findOneAndUpdate(
                { teacher: record.teacher, date: record.date }, 
                { reason: "Marked via Attendance System" },
                { upsert: true }
            );

            // creating relief assignment for the absence
            await createReliefAssignmentsForAbsence(record._id);

        } else {
            // 1. Remove the Absence record
            await Absence.deleteOne({ teacher: record.teacher, date: record.date });
            
            await ReliefAssignment.deleteMany({ 
                attendance: record._id 
            });
        }

        res.json({ success: true, record });
    } catch (error) {
        console.error("Attendance Update Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Export CSV
export const exportCSV = async (req, res) => {
    try {
        const { date } = req.query;
        const records = await attendanceModel.find({ date });

        const data = records.map(r => [r.teacherName, r.status, r.checkIn || '-', r.checkOut || '-']);
        const output = stringify(data, { header: true, columns: ['Teacher', 'Status', 'Check-In', 'Check-Out'] });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.csv`);
        res.send(output);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Export PDF
export const exportPDF = async (req, res) => {
    try {
        const { date, teacherId } = req.query;
        let query = {};
        if (date) query.date = { $regex: `^${date}` };
        if (teacherId) query.teacher = teacherId;

        const records = await attendanceModel.find(query).sort({ date: 1 });

        if (!records || records.length === 0) {
            return res.status(404).json({ success: false, message: "No records found." });
        }

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${date}.pdf`);
        doc.pipe(res);

        // --- 1. HEADER BANNER ---
        doc.rect(0, 0, 612, 100).fill('#1e3a8a'); // Dark Blue Top Bar
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('H/Meegasara Maha Vidyalaya', 40, 35);
        doc.fontSize(10).font('Helvetica').text('TeachGrid Official Attendance Record', 40, 65);
        
        // --- 2. REPORT INFO ---
        doc.fillColor('#000000').moveDown(5);
        doc.fontSize(16).font('Helvetica-Bold').text('Attendance Summary', { underline: true });
        doc.fontSize(10).font('Helvetica').text(`Report Period: ${date}`);
        doc.text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown(2);

        // --- 3. TABLE HEADERS ---
        const tableTop = 200;
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Date', 40, tableTop);
        doc.text('Teacher Name', 130, tableTop);
        doc.text('Timing', 320, tableTop);
        doc.text('Status', 480, tableTop);

        // Draw Header Line
        doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#cccccc').stroke();
        
        // --- 4. TABLE ROWS ---
        let rowY = tableTop + 30;
        doc.font('Helvetica').fontSize(10);

        records.forEach((r) => {
            // Alternating Row Background
            if (rowY > 750) { doc.addPage(); rowY = 50; } // Handle Page Break

            doc.fillColor('#000000').text(r.date, 40, rowY);
            doc.text(r.teacherName, 130, rowY, { width: 180 });
            doc.text(`${r.checkIn || '--'} - ${r.checkOut || '--'}`, 320, rowY);

            // COLOR CODED STATUS
            let statusColor = '#6b7280'; // Gray (Default)
            if (r.status === 'present') statusColor = '#15803d'; // Green
            if (r.status === 'late') statusColor = '#b45309';    // Orange
            if (r.status === 'leave') statusColor = '#b91c1c';   // Red

            // Draw status with color
            doc.fillColor(statusColor).font('Helvetica-Bold').text(r.status.toUpperCase(), 480, rowY);
            doc.font('Helvetica').fillColor('#000000');

            rowY += 25; // Space between rows
        });

        // --- 5. FOOTER ---
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#9ca3af').text(
                `This is a computer-generated document by TeachGrid. Page ${i + 1} of ${pages.count}`,
                0, 780, { align: 'center' }
            );
        }

        doc.end();

    } catch (error) {
        if (!res.headersSent) res.status(500).json({ success: false, message: error.message });
    }
};

// 7.0Get attendance history for the logged-in teacher
export const getMyAttendance = async (req, res) => {
    try {
        // req.userId is set by your userAuth middleware
        const teacherId = req.userId; 

        if (!teacherId) {
            return res.status(401).json({ success: false, message: "User ID not found in token" });
        }

        // Find all records where 'teacher' matches the logged-in user
        const records = await attendanceModel.find({ teacher: teacherId })
                                           .sort({ date: -1 }); // Newest first

        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};