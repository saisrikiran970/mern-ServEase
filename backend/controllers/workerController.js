const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getWorkerJobs = async (req, res) => {
  try {
    const jobs = await Booking.find({ workerId: req.user._id })
      .populate('userId', 'name phone')
      .populate('serviceId', 'title category price')
      .sort('-date');
      
    const jobsWithDetails = await Promise.all(jobs.map(async (job) => {
      const jobObj = job.toObject();
      jobObj.netEarnings = job.totalAmount * 0.90;
      
      if (job.paymentType === 'before') {
        jobObj.paymentStatus = 'paid';
      } else {
        const payment = await Payment.findOne({ bookingId: job._id, status: 'paid' });
        jobObj.paymentStatus = payment ? 'paid' : 'pending payment';
      }
      return jobObj;
    }));

    res.status(200).json({ success: true, data: jobsWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingJobs = async (req, res) => {
  try {
    const pendingJobs = await Booking.find({ workerId: req.user.id, status: 'assigned' })
      .populate('serviceId', 'title category price')
      .populate('userId', 'name')
      .sort('date');
    
    console.log('Assigned bookings found:', pendingJobs.length);
    res.status(200).json({ success: true, data: pendingJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acceptJob = async (req, res) => {
  try {
    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended. Cannot accept jobs.' });
    }

    const job = await Booking.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Job is not in assigned state' });
    }

    job.status = 'in-progress';
    await job.save();

    res.status(200).json({ success: true, data: job, message: 'Job accepted and is now in-progress' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Booking.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Can only reject newly assigned jobs' });
    }

    // Rejecting sets status to 'rejected' so admin can reassign
    job.status = 'rejected';
    job.workerNote = req.body.reason || 'Rejected by worker';
    await job.save();

    res.status(200).json({ success: true, data: job, message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    const { status } = req.body;
    if (!['in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const job = await Booking.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (status === 'in-progress' && job.status !== 'assigned') {
      return res.status(400).json({ success: false, message: 'Can only start assigned jobs' });
    }

    if (status === 'completed' && job.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Job must be in-progress to complete' });
    }

    job.status = status;
    await job.save();

    // If completed, update worker completedJobs count atomically
    if (status === 'completed') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { completedJobs: 1 } });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'paid' }).populate({
      path: 'bookingId',
      match: { workerId: req.user._id }
    });

    // Filter out payments where booking doesn't match this worker
    const workerPayments = payments.filter(p => p.bookingId !== null);
    
    // Some logic: The spec says Payment has a workerEarnings field, but we might just calculate it here
    const earningsData = workerPayments.map(p => ({
      date: p.createdAt,
      bookingId: p.bookingId._id,
      amount: p.amount,
      commission: p.adminCommission,
      netEarned: p.workerEarnings
    }));

    // Read totalEarnings from User model
    const worker = await User.findById(req.user._id);
    const totalEarnings = worker.totalEarnings || 0;

    res.status(200).json({ success: true, data: { totalEarnings, history: earningsData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const worker = await User.findById(req.user._id);
    const pendingJobs = await Booking.countDocuments({ workerId: req.user._id, status: 'assigned' });
    
    // Mini bar chart data: jobs completed per week (last 4 weeks for simplicity)
    // To implement simply, we just send empty or mock for now, or aggregate
    res.status(200).json({ 
      success: true, 
      data: {
        completedJobs: worker.completedJobs,
        pendingJobs,
        totalEarnings: worker.totalEarnings,
        rating: worker.rating
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
