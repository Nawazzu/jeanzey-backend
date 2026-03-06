// backend/controllers/complaintController.js
import complaintModel from '../models/complaintModel.js';

// ── User: Submit a complaint / return / refund request ──
const submitComplaint = async (req, res) => {
  try {
    const { userId } = req.body;
    const { orderId, itemId, itemName, itemImage, itemPrice, type, message } = req.body;

    if (!userId) return res.json({ success: false, message: 'User not authenticated' });
    if (!orderId || !itemId || !type || !message) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    if (!['complaint', 'return', 'refund'].includes(type)) {
      return res.json({ success: false, message: 'Invalid complaint type' });
    }
    if (message.trim().length < 10) {
      return res.json({ success: false, message: 'Message must be at least 10 characters' });
    }

    // Prevent duplicate open complaints for same item
    const existing = await complaintModel.findOne({
      userId,
      orderId,
      itemId,
      status: { $in: ['open', 'in_review'] }
    });
    if (existing) {
      return res.json({
        success: false,
        message: 'You already have an open request for this item. Please wait for resolution.'
      });
    }

    const complaint = new complaintModel({
      userId,
      orderId,
      itemId,
      itemName: itemName || '',
      itemImage: itemImage || '',
      itemPrice: itemPrice || 0,
      type,
      message: message.trim()
    });

    await complaint.save();
    res.json({ success: true, message: 'Your request has been submitted successfully', complaint });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ── User: Get all complaints for the logged-in user ──
const getUserComplaints = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.json({ success: false, message: 'User not authenticated' });

    const complaints = await complaintModel
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ── Admin: Get all complaints ──
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await complaintModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ── Admin: Update complaint status + optional admin note ──
const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, adminNote } = req.body;

    if (!complaintId || !status) {
      return res.json({ success: false, message: 'Missing required fields' });
    }
    if (!['open', 'in_review', 'resolved', 'rejected'].includes(status)) {
      return res.json({ success: false, message: 'Invalid status' });
    }

    const complaint = await complaintModel.findById(complaintId);
    if (!complaint) return res.json({ success: false, message: 'Complaint not found' });

    complaint.status = status;
    if (adminNote !== undefined) complaint.adminNote = adminNote.trim();
    if (status === 'resolved' || status === 'rejected') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    res.json({ success: true, message: 'Complaint updated successfully', complaint });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { submitComplaint, getUserComplaints, getAllComplaints, updateComplaintStatus };