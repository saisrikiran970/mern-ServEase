const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const services = [
  { title: 'Home Deep Cleaning', category: 'Cleaning', price: 2500, description: 'Complete deep cleaning of your home', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', isActive: true, rating: 4.8 },
  { title: 'AC Service & Repair', category: 'AC Service', price: 500, description: 'Professional AC servicing and gas refill', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', isActive: true, rating: 4.5 },
  { title: 'Plumbing Works', category: 'Plumbing', price: 300, description: 'Fixing leaks, pipes, and bathroom fittings', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80', isActive: true, rating: 4.7 },
  { title: 'Electrical Fixes', category: 'Electrical', price: 250, description: 'Wiring, switch replacements, and electrical repairs', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80', isActive: true, rating: 4.6 },
  { title: 'Salon at Home', category: 'Salon', price: 1200, description: 'Premium salon services delivered to your doorstep', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', isActive: true, rating: 4.9 },
  { title: 'House Painting', category: 'Painting', price: 5000, description: 'Interior and exterior professional painting', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80', isActive: true, rating: 4.8 },
  { title: 'Carpentry Services', category: 'Carpentry', price: 800, description: 'Custom furniture and wooden repairs', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80', isActive: true, rating: 4.4 },
  { title: 'Washing Machine Repair', category: 'Repair', price: 600, description: 'Expert repair for all types of washing machines', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80', isActive: true, rating: 4.5 }
];

const seedDatabase = async () => {
  try {
    await Service.deleteMany();
    await User.deleteMany();

    await Service.insertMany(services);
    
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const workerPassword = await bcrypt.hash('Worker@123', salt);

    await User.create([
      { name: 'Admin User', email: 'admin@servease.com', password: adminPassword, role: 'admin' },
      { name: 'John Plumber', email: 'john@servease.com', password: workerPassword, role: 'worker', serviceType: 'Plumbing', rating: 4.8 },
      { name: 'Jane Cleaner', email: 'jane@servease.com', password: workerPassword, role: 'worker', serviceType: 'Cleaning', rating: 4.9 }
    ]);

    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
