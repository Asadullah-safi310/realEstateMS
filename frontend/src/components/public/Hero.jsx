import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('SALE'); // SALE, RENT
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchType) params.append('purpose', searchType);
    if (location) params.append('city', location);
    if (propertyType) params.append('property_type', propertyType);
    
    navigate(`/properties/search?${params.toString()}`);
  };

  return (
    <div className="relative bg-gray-900 h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-2495db9a9cf6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Modern Home" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Find Your Dream Home
        </h1>
        <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Discover the perfect property from our extensive collection of homes, apartments, and commercial spaces.
        </p>

        {/* Search Box */}
        <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex space-x-4 mb-4 border-b border-gray-100 pb-4">
            <button 
              onClick={() => setSearchType('SALE')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                searchType === 'SALE' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Sale
            </button>
            <button 
              onClick={() => setSearchType('RENT')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                searchType === 'RENT' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              For Rent
            </button>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="City, Neighborhood, or Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="md:col-span-4">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="">Property Type</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button 
                type="submit"
                className="w-full h-full bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Search size={20} />
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
