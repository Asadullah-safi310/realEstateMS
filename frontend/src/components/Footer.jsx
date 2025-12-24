import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-blue-500">RealEstate</span>
              <span className="text-2xl font-light text-white">Pro</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Your trusted partner in finding the perfect property. We make real estate simple, transparent, and efficient.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/properties/search" className="text-gray-400 hover:text-white text-sm transition-colors">Properties</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <ul className="space-y-2">
              <li><Link to="/properties/search?purpose=sale" className="text-gray-400 hover:text-white text-sm transition-colors">Buy Property</Link></li>
              <li><Link to="/properties/search?purpose=rent" className="text-gray-400 hover:text-white text-sm transition-colors">Rent Property</Link></li>
              <li><Link to="/properties/search?type=residential" className="text-gray-400 hover:text-white text-sm transition-colors">Residential</Link></li>
              <li><Link to="/properties/search?type=commercial" className="text-gray-400 hover:text-white text-sm transition-colors">Commercial</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span>123 Real Estate Ave, Suite 100<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={18} className="flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={18} className="flex-shrink-0" />
                <span>info@realestatepro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RealEstatePro. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
