import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import MainLayout from '../layouts/MainLayout';
import PropertyStore from '../stores/PropertyStore';
import ImageCarousel from '../components/ImageCarousel';

const SearchProperties = observer(() => {
  const [filters, setFilters] = useState({
    city: '',
    property_type: '',
    purpose: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    status: '',
    availability: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    await PropertyStore.searchProperties(cleanFilters);
  };

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Search Properties</h1>

        <div className="bg-white shadow-md rounded p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Property Type</label>
              <select name="property_type" value={filters.property_type} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">All Types</option>
                <option value="plot">Plot</option>
                <option value="house">House</option>
                <option value="flat">Flat</option>
                <option value="shop">Shop</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Purpose</label>
              <select name="purpose" value={filters.purpose} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">All</option>
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Min Price</label>
              <input type="number" name="min_price" value={filters.min_price} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Max Price</label>
              <input type="number" name="max_price" value={filters.max_price} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Bedrooms</label>
              <input type="number" name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Availability</label>
              <select name="availability" value={filters.availability} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
                <option value="">All Availability</option>
                <option value="sale">For Sale Only</option>
                <option value="rent">For Rent Only</option>
                <option value="both">Sale & Rent</option>
              </select>
            </div>
          </div>

          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
            Search
          </button>
        </div>

        {PropertyStore.loading ? (
          <p>Loading...</p>
        ) : PropertyStore.properties.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No properties found matching your search criteria.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PropertyStore.properties.map(property => {
              const getAvailabilityBadges = (prop) => {
                const badges = [];
                if (Boolean(prop?.is_available_for_sale)) badges.push({ icon: '🟢', text: 'For Sale', color: 'bg-green-100 text-green-800' });
                if (Boolean(prop?.is_available_for_rent)) badges.push({ icon: '🔵', text: 'For Rent', color: 'bg-blue-100 text-blue-800' });
                if (badges.length === 2) {
                  return [{ icon: '🟣', text: 'Sale & Rent', color: 'bg-purple-100 text-purple-800' }];
                }
                return badges;
              };

              return (
              <div key={property.property_id} className="bg-white shadow-md rounded overflow-hidden hover:shadow-lg transition">
                <ImageCarousel images={property.photos || []} title="Property Photos" />

                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                      property.status === 'available' ? 'bg-green-500' :
                      property.status === 'sold' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      {property.status}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-3">
                    {getAvailabilityBadges(property).map((badge, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded font-semibold ${badge.color}`}>
                        {badge.icon} {badge.text}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Purpose</p>
                      <p className="font-semibold text-gray-800">{property.purpose}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-semibold text-gray-800">Rs {property.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Area</p>
                      <p className="font-semibold text-gray-800">{property.area_size}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bedrooms</p>
                      <p className="font-semibold text-gray-800">{property.bedrooms || 'N/A'}</p>
                    </div>
                  </div>

                  {property.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>
                  )}

                  {property.latitude && property.longitude && (
                    <a
                      href={`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded transition mb-4"
                    >
                      📍 View Map
                    </a>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
});

export default SearchProperties;
