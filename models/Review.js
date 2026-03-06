import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  userId: { type: String, default: null }, // optional if logged-in users
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Number, default: () => Date.now() },
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
