import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Edit, Trash2, Eye, User, MapPin, Phone, Mail } from 'lucide-react';
import authStore from '../../stores/AuthStore';
import axiosInstance from '../../api/axiosInstance';
import PropertyStore from '../../stores/PropertyStore';
import PropertyCard from '../../components/public/PropertyCard';
import { showSuccess, showError } from '../../utils/toast';

const MyDashboard = observer(() => {
  const { user } = authStore;
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sale', 'rent'

  const fetchProperties = async () => {
    try {
      const response = await axiosInstance.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const success = await PropertyStore.deleteProperty(id);
      if (success) {
        showSuccess('Property deleted successfully');
        fetchProperties();
      } else {
        showError('Failed to delete property');
      }
    }
  };

  const filteredProperties = properties.filter(prop => {
    if (activeTab === 'sale') return prop.is_available_for_sale;
    if (activeTab === 'rent') return prop.is_available_for_rent;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header & Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User size={40} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.full_name}</h1>
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
              {user?.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{user.address}</span>
                </div>
              )}
            </div>
          </div>
          <Link 
            to="/authenticated/profile"
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Properties Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Properties
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sale' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rent' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              For Rent
            </button>
          </div>

          <Link 
            to="/authenticated/properties/add" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} /> Add Property
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? "You haven't listed any properties yet." 
                : `You don't have any properties listed for ${activeTab}.`}
            </p>
            {activeTab === 'all' && (
              <Link 
                to="/authenticated/properties/add" 
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                <Plus size={20} /> Add your first property
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <div key={property.property_id} className="relative group">
                <PropertyCard property={property} />
                
                {/* Action Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    to={`/properties/${property.property_id}`}
                    className="p-2 bg-white text-gray-600 rounded-full shadow-sm hover:text-blue-600 transition-colors"
                    title="View Public Page"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link 
                    to={`/authenticated/properties/edit/${property.property_id}`}
                    className="p-2 bg-white text-gray-600 rounded-full shadow-sm hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(property.property_id)}
                    className="p-2 bg-white text-gray-600 rounded-full shadow-sm hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default MyDashboard;
