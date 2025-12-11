import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import MainLayout from '../layouts/MainLayout';
import PersonStore from '../stores/PersonStore';
import PropertyStore from '../stores/PropertyStore';
import ClientStore from '../stores/ClientStore';
import DealStore from '../stores/DealStore';
import { Users, Home, ShoppingCart, FileText, CheckCircle, TrendingUp, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, bgColor, textColor, borderColor }) => (
  <div className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${borderColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
        <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`${textColor} opacity-20`}>
        <Icon size={48} />
      </div>
    </div>
  </div>
);

const Dashboard = observer(() => {
  useEffect(() => {
    PersonStore.fetchPersons();
    PropertyStore.fetchProperties();
    ClientStore.fetchClients();
    DealStore.fetchDeals();
  }, []);

  const availableProperties = PropertyStore.properties.filter(p => p.status === 'available').length;
  const soldProperties = PropertyStore.properties.filter(p => p.status === 'sold').length;
  const rentedProperties = PropertyStore.properties.filter(p => p.status === 'rented').length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your business overview</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp size={18} className="text-green-600" />
            <span>All systems running smoothly</span>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Users}
            label="Total Owners"
            value={PersonStore.persons.length}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            borderColor="border-blue-400"
          />
          <StatCard 
            icon={Home}
            label="Total Properties"
            value={PropertyStore.properties.length}
            bgColor="bg-green-50"
            textColor="text-green-600"
            borderColor="border-green-400"
          />
          <StatCard 
            icon={ShoppingCart}
            label="Total Clients"
            value={ClientStore.clients.length}
            bgColor="bg-purple-50"
            textColor="text-purple-600"
            borderColor="border-purple-400"
          />
          <StatCard 
            icon={FileText}
            label="Total Deals"
            value={DealStore.deals.length}
            bgColor="bg-orange-50"
            textColor="text-orange-600"
            borderColor="border-orange-400"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Properties</h3>
              <CheckCircle size={24} className="opacity-75" />
            </div>
            <p className="text-5xl font-bold mb-2">{availableProperties}</p>
            <p className="text-blue-100 text-sm">Ready for listing</p>
            <div className="mt-4 w-full bg-blue-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full" 
                style={{width: PropertyStore.properties.length > 0 ? `${(availableProperties / PropertyStore.properties.length) * 100}%` : '0%'}}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sold Properties</h3>
              <TrendingUp size={24} className="opacity-75" />
            </div>
            <p className="text-5xl font-bold mb-2">{soldProperties}</p>
            <p className="text-green-100 text-sm">Successfully sold</p>
            <div className="mt-4 w-full bg-green-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full" 
                style={{width: PropertyStore.properties.length > 0 ? `${(soldProperties / PropertyStore.properties.length) * 100}%` : '0%'}}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rented Properties</h3>
              <Clock size={24} className="opacity-75" />
            </div>
            <p className="text-5xl font-bold mb-2">{rentedProperties}</p>
            <p className="text-purple-100 text-sm">Currently rented</p>
            <div className="mt-4 w-full bg-purple-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full" 
                style={{width: PropertyStore.properties.length > 0 ? `${(rentedProperties / PropertyStore.properties.length) * 100}%` : '0%'}}
              />
            </div>
          </div>
        </div>

        {/* Summary Info */}
        <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-blue-600">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {PropertyStore.properties.length > 0 ? ((availableProperties / PropertyStore.properties.length) * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-gray-600">Availability Rate</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {DealStore.deals.length}
              </div>
              <p className="text-gray-600">Total Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {PersonStore.persons.length + ClientStore.clients.length}
              </div>
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
});

export default Dashboard;
