import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Share2, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-heading font-bold text-2xl text-white mb-4 block">ServEase</span>
            <p className="text-sm text-gray-400 mb-4">
              Professional home services at your doorstep. We connect you with verified, trusted professionals for all your home needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><MessageCircle className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Share2 className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services?cat=Cleaning" className="hover:text-white transition-colors">Home Cleaning</Link></li>
              <li><Link to="/services?cat=AC Service" className="hover:text-white transition-colors">AC Service</Link></li>
              <li><Link to="/services?cat=Plumbing" className="hover:text-white transition-colors">Plumbing</Link></li>
              <li><Link to="/services?cat=Electrical" className="hover:text-white transition-colors">Electrical</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> support@servease.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> 123 Service Street, Tech City</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ServEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
