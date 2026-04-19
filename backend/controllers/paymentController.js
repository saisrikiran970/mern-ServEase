const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const amount = booking.totalAmount;

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: bookingId.toString()
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      bookingId,
      userId: req.user._id,
      amount,
      status: 'created',
      razorpayOrderId: order.id
    });

    res.status(200).json({ success: true, data: { orderId: order.id, amount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'paid';
      payment.adminCommission = payment.amount * 0.10;
      payment.workerEarnings = payment.amount * 0.90;
      await payment.save();

      const booking = await Booking.findById(bookingId);
      if (booking) {
        if (booking.paymentType === 'after') {
          booking.status = 'completed';
        } else {
          booking.status = 'paid';
        }
        await booking.save();
        
        if (booking.workerId) {
          try {
            await User.findByIdAndUpdate(booking.workerId, {
              $inc: { totalEarnings: payment.workerEarnings }
            });
          } catch (workerUpdateError) {
            console.error(`Failed to update earnings for worker ${booking.workerId}:`, workerUpdateError);
          }
        }
      }

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).populate('bookingId');
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
