import React, { useEffect, useState } from 'react';
import { Search, Eye, Trash2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { showSuccess, showError } from '../../utils/toast';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'sale', 'rent'

  const fetchProperties = async () => {
    try {
      const response = await axiosInstance.get('/admin/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      showError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await axiosInstance.delete(`/properties/${id}`);
      showSuccess('Property deleted successfully');
      setProperties(properties.filter(p => p.property_id !== id));
    } catch (error) {
      showError('Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      prop.property_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.Owner?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'sale' ? prop.is_available_for_sale :
      filter === 'rent' ? prop.is_available_for_rent : true;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((prop) => (
                <tr key={prop.property_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {prop.photos && prop.photos.length > 0 ? (
                        <img className="h-10 w-10 rounded-lg object-cover" src={prop.photos[0]} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                          <Filter size={16} />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{prop.property_type}</div>
                        <div className="text-sm text-gray-500">{prop.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{prop.Owner?.full_name}</div>
                    <div className="text-sm text-gray-500">{prop.Owner?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {prop.is_available_for_sale && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Sale
                        </span>
                      )}
                      {prop.is_available_for_rent && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Rent
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prop.is_available_for_sale && <div>Sale: ${prop.sale_price}</div>}
                    {prop.is_available_for_rent && <div>Rent: ${prop.rent_price}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/properties/${prop.property_id}`}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                        target="_blank"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prop.property_id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProperties;
