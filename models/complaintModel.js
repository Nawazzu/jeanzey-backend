// backend/models/complaintModel.js
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  // Snapshot of item details at time of complaint
  itemName: { type: String, default: '' },
  itemImage: { type: String, default: '' },
  itemPrice: { type: Number, default: 0 },

  type: {
    type: String,
    enum: ['complaint', 'return', 'refund'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_review', 'resolved', 'rejected'],
    default: 'open'
  },
  // Admin's response/resolution note
  adminNote: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt on save
complaintSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const complaintModel = mongoose.models.complaint || mongoose.model('complaint', complaintSchema);
export default complaintModel;