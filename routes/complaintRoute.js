// backend/routes/complaintRoute.js
import express from 'express';
import {
  submitComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const complaintRouter = express.Router();

// User routes (protected by user auth)
complaintRouter.post('/submit', authUser, submitComplaint);
complaintRouter.post('/user-list', authUser, getUserComplaints);

// Admin routes (protected by admin auth)
complaintRouter.post('/list', adminAuth, getAllComplaints);
complaintRouter.post('/update-status', adminAuth, updateComplaintStatus);

export default complaintRouter;