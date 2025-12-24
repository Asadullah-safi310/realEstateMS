import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Menu, X, User, LogOut, LayoutDashboard, Home, PlusCircle } from 'lucide-react';
import authStore from '../stores/AuthStore';

const Navbar = observer(({ onOpenLogin, onOpenRegister }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = authStore;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAddPropertyClick = () => {
    setIsMenuOpen(false);
    if (isAuthenticated) {
      navigate('/authenticated/properties/add');
    } else {
      onOpenLogin();
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">RealEstate</span>
              <span className="text-2xl font-light text-gray-800">Pro</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/properties/search" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Properties
            </Link>
            
            <button 
              onClick={handleAddPropertyClick}
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
            >
              <PlusCircle size={16} /> Add Property
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/authenticated/dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                
                <div className="relative ml-3 group">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user?.full_name?.charAt(0) || <User size={18} />}
                    </div>
                    <span className="text-sm font-medium">{user?.username}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <Link to="/authenticated/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={onOpenLogin}
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenRegister}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Home
            </Link>
            <Link to="/properties/search" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Properties
            </Link>
            
            <button 
              onClick={handleAddPropertyClick}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center gap-2"
            >
              <PlusCircle size={16} /> Add Property
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/authenticated/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link to="/authenticated/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 px-3">
                <button
                  onClick={onOpenLogin}
                  className="w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenRegister}
                  className="w-full text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
});

export default Navbar;
