import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number, required: true, default: 1 },
  size: { type: String, default: "N/A" },
  image: { type: Array, default: [] },
  // per-item status and cancellation metadata
  status: { type: String, default: 'Order Placed' },
  cancellationReason: { type: String, default: '' },
  cancellationDate: { type: Number, default: null }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: [orderItemSchema], required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },
  priorityDelivery: { type: Boolean, default: false },
  priorityDeliveryFee: { type: Number, default: 0 },
  // ✅ ADD THESE TWO LINES FOR COUPON SUPPORT
  couponCode: { type: String, default: null },
  couponDiscount: { type: Number, default: 0 }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;