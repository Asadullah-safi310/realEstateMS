import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Home, Globe, Briefcase, ListChecks, UserCheck, TrendingUp } from 'lucide-react';
import authStore from '../../stores/AuthStore';
import axiosInstance from '../../api/axiosInstance';
import Avatar from '../../components/Avatar';

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
    total_managed: 0,
    total_assigned: 0,
    total_listed: 0,
    public_listings: 0,
    for_sale: 0,
    for_rent: 0,
    active_deals: 0
  });

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/properties/dashboard/stats');
      setStats(response.data);
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
          <Avatar user={user} size="xl" className="shadow-inner" />
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
      <div className="space-y-6">
        {/* Row 1: Managed Properties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={Home} 
            label="Total Managed" 
            value={stats.total_managed} 
            color="blue" 
          />
          <StatCard 
            icon={UserCheck} 
            label="Total Assigned" 
            value={stats.total_assigned} 
            color="purple" 
          />
          <StatCard 
            icon={ListChecks} 
            label="Total Listed/Created" 
            value={stats.total_listed} 
            color="indigo" 
          />
        </div>

        {/* Row 2: Public Listings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={Globe} 
            label="Public Listings" 
            value={stats.public_listings} 
            color="green" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="For Sale" 
            value={stats.for_sale} 
            color="emerald" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="For Rent" 
            value={stats.for_rent} 
            color="cyan" 
          />
        </div>

        {/* Row 3: Active Deals (only for agents) */}
        {user?.role === 'agent' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={Briefcase} 
              label="Completed Deals" 
              value={stats.active_deals} 
              color="orange" 
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default MyDashboard;
