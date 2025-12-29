import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Home, Globe, Briefcase } from 'lucide-react';
import authStore from '../../stores/AuthStore';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const MyDashboard = observer(() => {
  const { user } = authStore;
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    active_deals: 0
  });

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/properties/my-properties');
      const properties = response.data;
      
      const publicCount = properties.filter(p => (p.is_available_for_sale || p.is_available_for_rent) && p.status === 'available').length;
      
      let dealsCount = 0;
      if (user?.role === 'agent') {
        const dealsRes = await axiosInstance.get('/deals/my-deals');
        dealsCount = dealsRes.data.filter(d => d.status === 'active').length;
      }

      setStats({
        total: properties.length,
        public: publicCount,
        active_deals: dealsCount
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  return (
    <div className="space-y-8">
      {/* Header & Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
            <User size={40} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
              {user?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
          <Link 
            to="/authenticated/profile"
            className="px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition-all text-sm font-bold shadow-sm"
          >
            Manage Profile
          </Link>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Home} 
          label="Total Managed" 
          value={stats.total} 
          color="blue" 
        />
        <StatCard 
          icon={Globe} 
          label="Public Listings" 
          value={stats.public} 
          color="green" 
        />
        {user?.role === 'agent' && (
          <StatCard 
            icon={Briefcase} 
            label="Active Deals" 
            value={stats.active_deals} 
            color="purple" 
          />
        )}
      </div>
    </div>
  );
});

export default MyDashboard;
