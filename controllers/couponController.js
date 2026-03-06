// backend/controllers/couponController.js
import couponModel from "../models/couponModel.js";

// ✅ Create Coupon (Admin)
const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, description } = req.body;

    if (!code || !type || !value || !validFrom || !validUntil) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.json({ success: false, message: "Coupon code already exists" });
    }

    const newCoupon = new couponModel({
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      description: description || ''
    });

    await newCoupon.save();
    res.json({ success: true, message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get All Coupons (Admin)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get Active Coupons (Frontend)
const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await couponModel.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    }).select('code type value minOrderAmount maxDiscount description');

    res.json({ success: true, coupons });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Validate Coupon (Frontend - Real-time)
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const coupon = await couponModel.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.json({ success: false, message: "Coupon is inactive" });
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return res.json({ success: false, message: "Coupon not yet valid" });
    }
    if (now > coupon.validUntil) {
      return res.json({ success: false, message: "Coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ success: false, message: "Coupon usage limit reached" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      success: true,
      message: "Coupon applied successfully",
      discount: Math.round(discount),
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Apply Coupon (During Order Placement)
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await couponModel.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({ success: false, message: "Invalid coupon code" });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({ success: true, message: "Coupon applied" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Update Coupon (Admin)
// Handles both:
//   - toggle isActive (deactivate/activate)
//   - reactivate expired coupon (isActive: true + new validUntil date)
const updateCoupon = async (req, res) => {
  try {
    const { id, isActive, validUntil } = req.body; // ← now reads validUntil

    const coupon = await couponModel.findById(id);
    if (!coupon) {
      return res.json({ success: false, message: "Coupon not found" });
    }

    if (isActive !== undefined) {
      coupon.isActive = isActive;
    }

    // ✅ If a new validUntil date is provided (reactivation flow), update it
    if (validUntil) {
      const parsedDate = new Date(validUntil);
      if (isNaN(parsedDate.getTime())) {
        return res.json({ success: false, message: "Invalid validUntil date" });
      }
      coupon.validUntil = parsedDate;
    }

    await coupon.save();
    res.json({ success: true, message: "Coupon updated successfully", coupon });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Delete Coupon (Admin)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;

    await couponModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  validateCoupon,
  applyCoupon,
  updateCoupon,
  deleteCoupon
};