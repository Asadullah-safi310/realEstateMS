import React, { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Edit, Trash2, Eye, Filter, Home } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import PropertyStore from '../../stores/PropertyStore';
import PropertyCard from '../../components/public/PropertyCard';
import { showSuccess, showError } from '../../utils/toast';

const MyProperties = observer(() => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available'); // 'available' or 'all'

  const fetchProperties = async () => {
    try {
      // Use the authenticated endpoint to get created properties only
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

  const filteredProperties = useMemo(() => {
    if (filter === 'all') return properties;
    return properties.filter(p => p.is_available_for_sale || p.is_available_for_rent);
  }, [properties, filter]);

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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 text-sm">Manage your properties and listings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === 'available' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
          </div>

          <Link 
            to="/authenticated/properties/add" 
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} /> Add Property
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-6">You haven't listed any properties yet.</p>
          <Link 
            to="/authenticated/properties/add" 
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            <Plus size={20} /> Add your first property
          </Link>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No matching properties</h3>
          <p className="text-gray-600 mb-6">No properties match your current filter.</p>
          <button 
            onClick={() => setFilter('all')}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Show all properties
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <div key={property.property_id} className="relative group">
              <PropertyCard property={property} />
              
              {/* Action Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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
  );
});

export default MyProperties;
