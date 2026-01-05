import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import Absence from "../models/absenceModel.js"; // Ensure the filename matches exactly
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

// 1. Get all users who are teachers
export const getTeachers = async (req, res) => {
    try {
        const teachers = await userModel.find({ role: 'teacher' }).select('name email _id');
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
        
        // DEBUG: Check if teachers are actually being found
        console.log(`Initialising attendance for ${date}. Teachers found: ${teachers.length}`);

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
                        subject: t.subject || "General"
                    }
                },
                upsert: true
            }
        }));

        // 2. Execute bulkWrite
        const result = await attendanceModel.bulkWrite(operations);
        
        console.log("BulkWrite successful:", result.upsertedCount, "new records created.");
        
        res.json({ success: true, message: `Attendance initialized for ${date}` });

    } catch (error) {
        // THIS IS KEY: It prints the actual error to your VS Code / Terminal console
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

// 4. Update attendance status (Syncs with Absence model)
export const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, checkIn, checkOut, subject } = req.body;

        const record = await attendanceModel.findByIdAndUpdate(
            id, 
            { status, checkIn, checkOut, subject }, 
            { new: true }
        );

        if (!record) return res.status(404).json({ message: "Record not found" });

        // SYNC LOGIC with your Absence model
        if (status === 'leave') {
            // Create or update Absence record
            await Absence.findOneAndUpdate(
                { teacher: record.teacher, date: new Date(record.date) },
                { reason: "Marked via Attendance System" },
                { upsert: true }
            );
        } else {
            // If status changed from 'leave' to 'present/late', remove from Absence collection
            await Absence.deleteOne({ teacher: record.teacher, date: new Date(record.date) });
        }

        res.json({ success: true, record });
    } catch (error) {
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
        const { date } = req.query;
        const records = await attendanceModel.find({ date });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.pdf`);

        doc.pipe(res);
        doc.fontSize(20).text(`Attendance Report: ${date}`, { align: 'center' });
        doc.moveDown();

        records.forEach((r, i) => {
            doc.fontSize(12).text(`${i + 1}. ${r.teacherName} - ${r.status.toUpperCase()} (${r.checkIn || 'N/A'} - ${r.checkOut || 'N/A'})`);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};