import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { LayoutDashboard, Home, FileText, User, LogOut, Heart, ArrowLeft } from 'lucide-react';
import authStore from '../stores/AuthStore';

const AuthenticatedLayout = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await authStore.logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-white w-64 h-screen shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-600">RealEstate</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/authenticated/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/authenticated/dashboard') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link 
            to="/authenticated/properties" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/authenticated/properties') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Home size={20} />
            <span className="font-medium">My Properties</span>
          </Link>

          <Link 
            to="/authenticated/favorites" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/authenticated/favorites') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Heart size={20} />
            <span className="font-medium">Favorites</span>
          </Link>
          
          <Link 
            to="/authenticated/deals" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/authenticated/deals') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <FileText size={20} />
            <span className="font-medium">My Deals</span>
          </Link>
          
          <Link 
            to="/authenticated/profile" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive('/authenticated/profile') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl w-full transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
});

export default AuthenticatedLayout;
