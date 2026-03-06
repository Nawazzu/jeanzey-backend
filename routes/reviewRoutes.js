import express from 'express';
import { addReview, getProductReviews } from '../controllers/reviewController.js';
// optional: import auth middleware if you want to require login
// import authUser from '../middleware/auth.js';

const router = express.Router();

// Add review (POST)
router.post('/add', addReview);

// Get reviews for a product (GET)
router.get('/product/:productId', getProductReviews);

export default router;
