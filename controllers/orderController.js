import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';
import { reduceStock } from "./productController.js";

const currency = 'inr';
const deliveryCharge = 50;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------- Place order (COD) --------------------
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, priorityDelivery, couponCode, couponDiscount } = req.body;

    if (!userId) return res.json({ success: false, message: "User not authenticated" });
    if (!items || items.length === 0) return res.json({ success: false, message: "No items in order" });
    if (!address) return res.json({ success: false, message: "Address is required" });

    const priorityFee = priorityDelivery ? 100 : 0;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
      priorityDelivery: priorityDelivery || false,
      priorityDeliveryFee: priorityFee,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await reduceStock(items);
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      message: "Order Placed Successfully",
      order_id: newOrder._id,
      order: newOrder
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Stripe place --------------------
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address, priorityDelivery, couponCode, couponDiscount } = req.body;
    const { origin } = req.headers;

    const priorityFee = priorityDelivery ? 100 : 0;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
      priorityDelivery: priorityDelivery || false,
      priorityDeliveryFee: priorityFee,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: { name: 'Delivery Charges' },
        unit_amount: deliveryCharge * 100
      },
      quantity: 1
    });

    if (priorityDelivery) {
      line_items.push({
        price_data: {
          currency: currency,
          product_data: { name: 'Priority Delivery (24hrs)' },
          unit_amount: priorityFee * 100
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Verify Stripe --------------------
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      const order = await orderModel.findById(orderId);
      if (order) await reduceStock(order.items);

      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Razorpay place --------------------
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address, priorityDelivery, couponCode, couponDiscount } = req.body;

    const priorityFee = priorityDelivery ? 100 : 0;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
      priorityDelivery: priorityDelivery || false,
      priorityDeliveryFee: priorityFee,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString()
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Verify Razorpay --------------------
const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === 'paid') {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      const order = await orderModel.findById(orderInfo.receipt);
      if (order) await reduceStock(order.items);

      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: 'Payment Failed' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Admin: all orders --------------------
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- User: user orders --------------------
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Admin: update status --------------------
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.status = status;
    order.items = order.items.map(item => {
      const isCancelled = item.status && item.status.toLowerCase() === 'cancelled';
      if (!isCancelled) return { ...item, status: status };
      return item;
    });

    order.markModified('items');
    await order.save();

    res.json({ success: true, message: 'Status Updated' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Admin: update payment status ✅ NEW --------------------
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;

    if (!orderId || payment === undefined) {
      return res.json({ success: false, message: "orderId and payment are required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.payment = Boolean(payment);
    await order.save();

    res.json({
      success: true,
      message: payment ? "Payment marked as received" : "Payment marked as pending",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------- Cancel specific item --------------------
const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId, cancellationReason } = req.body;

    if (!orderId || !itemId || !cancellationReason) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    const itemIndex = order.items.findIndex((item) =>
      item._id && item._id.toString() === itemId.toString()
    );

    if (itemIndex === -1) return res.json({ success: false, message: "Item not found in order" });
    if (order.items[itemIndex].status === 'Cancelled') {
      return res.json({ success: false, message: "Item already cancelled" });
    }

    order.items[itemIndex].status = "Cancelled";
    order.items[itemIndex].cancellationReason = cancellationReason;
    order.items[itemIndex].cancellationDate = Date.now();

    order.markModified('items');

    const allCancelled = order.items.every((item) =>
      item.status && item.status.toLowerCase() === "cancelled"
    );
    if (allCancelled) order.status = "Cancelled";

    await order.save();

    return res.json({ success: true, message: "Order item cancelled successfully", order });

  } catch (error) {
    console.error("Cancel order item error:", error);
    return res.json({ success: false, message: "Server error" });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  verifyStripe,
  verifyRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  updatePaymentStatus,
  cancelOrderItem
};