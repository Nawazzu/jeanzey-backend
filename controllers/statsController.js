import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import reviewModel from "../models/Review.js";

const getStats = async (req, res) => {
  try {
    const [userCount, orderCount, productCount, reviews] = await Promise.all([
      userModel.countDocuments({}),
      orderModel.countDocuments({}),
      productModel.countDocuments({}),
      reviewModel.find({}, { rating: 1 }),
    ]);

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';

    res.json({
      success: true,
      stats: {
        users: userCount,
        orders: orderCount,
        products: productCount,
        avgRating,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getStats };