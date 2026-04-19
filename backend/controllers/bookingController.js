const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.createBooking = async (req, res) => {
  try {
    console.log('Incoming Booking Data:', req.body);
    const { serviceId, workerId, address, date, timeSlot, paymentType } = req.body;
    
    if (!date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Date and time slot are required' });
    }

    if (!address || !address.street || !address.city || !address.pincode) {
      return res.status(400).json({ success: false, message: 'Complete address details are required' });
    }

    // Prevent double booking
    const existingBooking = await Booking.findOne({
      serviceId,
      date,
      timeSlot,
      status: { $nin: ['cancelled', 'rejected'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'This service is already booked for the selected date and time slot' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const booking = await Booking.create({
      userId: req.user.id, // strictly using authenticated user token
      workerId,
      serviceId,
      address,
      date,
      timeSlot,
      paymentType,
      totalAmount: service.price,
      status: workerId ? 'assigned' : 'pending'
    });

    // Increment booking count
    service.bookingCount += 1;
    await service.save();

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('serviceId', 'title image price category')
      .populate('workerId', 'name phone rating avatar serviceType')
      .sort('-createdAt');
      
    const bookingsWithPayment = await Promise.all(bookings.map(async (booking) => {
      const bObj = booking.toObject();
      if (bObj.paymentType === 'before') {
        bObj.isPaid = true;
      } else {
        const payment = await Payment.findOne({ bookingId: bObj._id, status: 'paid' });
        bObj.isPaid = !!payment;
      }
      return bObj;
    }));

    res.status(200).json({ success: true, data: bookingsWithPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('serviceId', 'title category')
      .populate('workerId', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('serviceId')
      .populate('workerId', 'name phone rating avatar');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rateBooking = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed bookings' });
    }

    if (booking.rating) {
      return res.status(400).json({ success: false, message: 'Booking already rated' });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Update worker rating
    if (booking.workerId) {
      const allWorkerBookings = await Booking.find({ workerId: booking.workerId, rating: { $exists: true } });
      const totalRating = allWorkerBookings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalRating / allWorkerBookings.length;

      const worker = await User.findById(booking.workerId);
      worker.rating = avgRating;
      
      if (avgRating < 2.5) {
        worker.isActive = false; // auto-suspend
      }
      await worker.save();
    }
    
    // Update service rating
    if (booking.serviceId) {
      const allServiceBookings = await Booking.find({ serviceId: booking.serviceId, rating: { $exists: true } });
      const totalRating = allServiceBookings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalRating / allServiceBookings.length;
      
      await Service.findByIdAndUpdate(booking.serviceId, { rating: avgRating });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
