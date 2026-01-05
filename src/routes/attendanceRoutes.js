import express from 'express';
import { 
    getTeachers, 
    initAttendance, 
    getAttendanceByDate, 
    updateAttendance, 
    exportCSV, 
    exportPDF, 
    getMyAttendance
} from '../controllers/attendanceController.js';
import userAuth from '../middleware/userAuth.js';

const attendanceRouter = express.Router();

// 1. Get list of all teachers
attendanceRouter.get('/teachers', getTeachers);

// 2. Initialize attendance for all teachers for a specific date
// Expected body: { "date": "YYYY-MM-DD" }
attendanceRouter.post('/init', initAttendance);

// 3. Get all attendance records for a specific date (with optional search query 'q')
// Example: /api/attendance?date=2026-01-04&q=John
attendanceRouter.get('/', getAttendanceByDate);

// 4. Update a specific attendance record
attendanceRouter.put('/:id', updateAttendance);

// 5. Export routes
attendanceRouter.get('/export/csv', exportCSV);
attendanceRouter.get('/export/pdf', exportPDF);

// 6. To get the logedin users attendance data
attendanceRouter.get('/my-attendance', userAuth, getMyAttendance);

export default attendanceRouter;