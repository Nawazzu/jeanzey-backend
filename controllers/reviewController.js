import Review from '../models/Review.js';

// Add a review
const addReview = async (req, res) => {
  try {
    // Expecting { productId, name, rating, comment, userId? }
    const { productId, name, rating, comment, userId } = req.body;
    if (!productId || !name || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const newReview = new Review({
      productId,
      userId: userId || null,
      name,
      rating,
      comment,
      date: Date.now(),
    });

    await newReview.save();

    // Return created review
    res.json({ success: true, review: newReview });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a product (paginated optional)
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId required' });
    }

    // Optional query params: page, limit
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ productId }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments({ productId }),
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addReview, getProductReviews };
