const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

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

    // Allow dummy mode if keys are placeholders
    if (process.env.RAZORPAY_KEY_ID === 'xxx') {
      console.warn("Using Razorpay placeholder keys. Bypassing actual Razorpay creation.");
      const dummyPayment = await Payment.create({
        bookingId,
        userId: req.user._id,
        amount,
        status: 'created',
        razorpayOrderId: 'order_dummy_' + Date.now()
      });
      return res.status(200).json({ success: true, data: { orderId: dummyPayment.razorpayOrderId, amount } });
    }

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

    // Dummy mode bypass
    if (process.env.RAZORPAY_KEY_ID === 'xxx') {
      payment.razorpayPaymentId = razorpayPaymentId || 'pay_dummy';
      payment.razorpaySignature = razorpaySignature || 'sig_dummy';
      payment.status = 'paid';
      payment.adminCommission = payment.amount * 0.10;
      payment.workerEarnings = payment.amount * 0.90;
      await payment.save();

      await Booking.findByIdAndUpdate(bookingId, { status: 'paid' });
      return res.status(200).json({ success: true, message: 'Payment verified (Dummy Mode)' });
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

      await Booking.findByIdAndUpdate(bookingId, { status: 'paid' });

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
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
