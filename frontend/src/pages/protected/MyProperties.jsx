import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Edit, Trash2, Eye } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import PropertyStore from '../../stores/PropertyStore';
import PropertyCard from '../../components/public/PropertyCard';
import { showSuccess, showError } from '../../utils/toast';

const MyProperties = observer(() => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      // Use the authenticated endpoint to get ONLY the user's properties
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
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
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-6">You haven't listed any properties yet.</p>
          <Link 
            to="/authenticated/properties/add" 
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            <Plus size={20} /> Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
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
  );
});

export default MyProperties;
