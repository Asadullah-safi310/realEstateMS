import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Filter, Search, Loader2 } from 'lucide-react';
import PropertyCard from '../components/public/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import axiosInstance from '../api/axiosInstance';

const SearchProperties = observer(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    property_type: searchParams.get('property_type') || '',
    purpose: searchParams.get('purpose') || '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    status: 'available',
    availability: '',
  });

  useEffect(() => {
    // Update filters from URL params on mount/change
    setFilters(prev => ({
      ...prev,
      city: searchParams.get('city') || '',
      property_type: searchParams.get('property_type') || '',
      purpose: searchParams.get('purpose') || '',
    }));
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      
      // Convert filters to query string
      const params = new URLSearchParams(cleanFilters);
      const response = await axiosInstance.get(`/public/properties/search?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]); // Re-fetch when URL params change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with new filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    setSearchParams(cleanFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select 
                    name="property_type" 
                    value={filters.property_type} 
                    onChange={handleFilterChange} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Types</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Land">Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <select 
                    name="purpose" 
                    value={filters.purpose} 
                    onChange={handleFilterChange} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All</option>
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input 
                      type="number" 
                      name="min_price" 
                      value={filters.min_price} 
                      onChange={handleFilterChange} 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input 
                      type="number" 
                      name="max_price" 
                      value={filters.max_price} 
                      onChange={handleFilterChange} 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input 
                    type="number" 
                    name="bedrooms" 
                    value={filters.bedrooms} 
                    onChange={handleFilterChange} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Search size={18} /> Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Results Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {loading ? 'Searching...' : `${properties.length} Properties Found`}
                </h1>
                {filters.city && <p className="text-gray-600">in {filters.city}</p>}
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {showMap ? 'Show List' : 'Show Map'}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="animate-spin text-blue-600" />
              </div>
            ) : showMap ? (
              <PropertyMap 
                properties={properties} 
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
              />
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map(property => (
                  <PropertyCard key={property.property_id} property={property} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default SearchProperties;
