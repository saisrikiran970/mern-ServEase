const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  },
  adminCommission: Number, // 10% of amount
  workerEarnings: Number // 90% of amount
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
