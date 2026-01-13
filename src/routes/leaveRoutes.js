import express from 'express';
import { applyLeave, getAllLeaves, getLeaveStats, getMyLeaves, updateStatus } from '../controllers/leaveController.js';
import upload from '../middleware/multer.js';
import userAuth from '../middleware/userAuth.js';

const leaveRouter = express.Router();


leaveRouter.post('/apply', userAuth, upload.array('documents', 5), applyLeave);
leaveRouter.get('/list', userAuth, getMyLeaves);
leaveRouter.get('/all', userAuth, getAllLeaves);
leaveRouter.get('/stats', userAuth, getLeaveStats);
leaveRouter.put('/update/:id', userAuth, updateStatus);

export default leaveRouter;