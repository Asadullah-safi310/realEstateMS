import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, TrendingUp, Home } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalDeals: 0,
    propertiesForSale: 0,
    propertiesForRent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Properties" 
          value={stats.totalProperties} 
          icon={Building2} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Total Deals" 
          value={stats.totalDeals} 
          icon={FileText} 
          color="bg-green-500" 
        />
        <StatCard 
          title="For Sale" 
          value={stats.propertiesForSale} 
          icon={TrendingUp} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="For Rent" 
          value={stats.propertiesForRent} 
          icon={Home} 
          color="bg-purple-500" 
        />
      </div>

      {/* Placeholder for charts or recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-64 flex items-center justify-center text-gray-400">
          Activity Chart Placeholder
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-64 flex items-center justify-center text-gray-400">
          Recent Registrations Placeholder
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
