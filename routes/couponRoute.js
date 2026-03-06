// backend/routes/couponRoute.js
import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  validateCoupon,
  applyCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';

const couponRouter = express.Router();

// ✅ Admin routes (protected)
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, getAllCoupons);
couponRouter.post('/update', adminAuth, updateCoupon);
couponRouter.post('/delete', adminAuth, deleteCoupon);

// ✅ Public routes (frontend)
couponRouter.get('/active', getActiveCoupons);
couponRouter.post('/validate', validateCoupon);
couponRouter.post('/apply', applyCoupon);

export default couponRouter;