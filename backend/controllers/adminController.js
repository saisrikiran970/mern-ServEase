const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const activeServices = await Service.countDocuments({ isActive: true });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    const payments = await Payment.find({ status: 'paid' });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.adminCommission, 0);

    // Bookings by Status
    const statuses = ['completed', 'pending', 'assigned', 'in-progress', 'cancelled'];
    const statusChart = [];
    for (const st of statuses) {
      statusChart.push(await Booking.countDocuments({ status: st }));
    }

    // Revenue Trend (Last 6 Months)
    const revenueLabels = [];
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      
      const monthRev = payments.reduce((acc, curr) => {
        if (!curr.createdAt) return acc;
        const pDate = new Date(curr.createdAt);
        if (pDate.getMonth() === targetMonth && pDate.getFullYear() === targetYear) {
          return acc + curr.adminCommission;
        }
        return acc;
      }, 0);
      
      revenueLabels.push(d.toLocaleString('default', { month: 'short' }));
      revenueData.push(monthRev);
    }

    res.status(200).json({
      success: true,
      data: { 
        totalUsers, totalWorkers, activeServices, completedBookings, totalRevenue,
        statusChart, revenueLabels, revenueData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isActive = !user.isActive; // toggle
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!['pending', 'paid', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Can only assign workers to pending/paid/rejected bookings' });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker' || !worker.isActive || worker.rating < 2.5) {
      return res.status(400).json({ success: false, message: 'Invalid or suspended worker selected' });
    }

    // Check if worker is already booked at this date and time
    const existingJob = await Booking.findOne({
      workerId,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: { $in: ['assigned', 'in-progress'] }
    });

    if (existingJob) {
      return res.status(400).json({ success: false, message: 'Worker is already booked for this time slot' });
    }

    console.log('Assigning worker. Booking ID:', req.params.id, 'Worker ID:', workerId);

    const updateResult = await Booking.updateOne(
      { _id: req.params.id }, 
      { $set: { workerId: workerId, status: 'assigned' } }
    );
    console.log('Update Result:', updateResult);

    const updatedBooking = await Booking.findById(req.params.id);

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'paid' })
      .populate('bookingId')
      .populate('userId', 'name')
      .sort('-createdAt');

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCommission = payments.reduce((acc, curr) => acc + curr.adminCommission, 0);
    const totalWorkerPayouts = payments.reduce((acc, curr) => acc + curr.workerEarnings, 0);

    res.status(200).json({
      success: true,
      data: {
        summary: { totalRevenue, totalCommission, totalWorkerPayouts },
        payments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // Generate dummy data for charts for now, or implement actual aggregation
    res.status(200).json({ success: true, message: 'Analytics endpoint placeholder' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found for this booking' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
