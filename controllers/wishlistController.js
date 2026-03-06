import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// ✅ Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({ success: true, message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Add Wishlist Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user;
    const { productId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    res.json({ success: true, message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Remove Wishlist Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get wishlist items
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user;
    const user = await userModel
      .findById(userId)
      .populate("wishlist", "name price image"); // Populate product data

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
