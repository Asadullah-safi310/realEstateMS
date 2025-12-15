import { useState } from 'react';
import { X } from 'lucide-react';

const PropertyFilterPanel = ({ isOpen, onClose, filters, onApplyFilters, onClearFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleAvailabilityChange = (type, checked) => {
    setTempFilters(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [type]: checked
      }
    }));
  };

  const handleMultiSelectChange = (key, option) => {
    setTempFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(option)) {
        return {
          ...prev,
          [key]: current.filter(item => item !== option)
        };
      } else {
        return {
          ...prev,
          [key]: [...current, option]
        };
      }
    });
  };

  const handleTextChange = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      availability: { sale: false, rent: false },
      propertyTypes: [],
      dealType: 'both',
      priceMin: '',
      priceMax: '',
      rentMin: '',
      rentMax: '',
      city: '',
      location: ''
    };
    setTempFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">🔍 Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Availability Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Availability</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={tempFilters.availability?.sale || false}
                  onChange={(e) => handleAvailabilityChange('sale', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-gray-700 font-medium">🟢 Available for Sale</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={tempFilters.availability?.rent || false}
                  onChange={(e) => handleAvailabilityChange('rent', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-gray-700 font-medium">🔵 Available for Rent</span>
              </label>
            </div>
          </div>

          {/* Property Type Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Type</h3>
            <div className="space-y-3">
              {['plot', 'house', 'flat', 'shop'].map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={tempFilters.propertyTypes?.includes(type) || false}
                    onChange={() => handleMultiSelectChange('propertyTypes', type)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-gray-700 font-medium capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deal Type Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Deal Type</h3>
            <div className="space-y-3">
              {[
                { value: 'both', label: 'Both Sale & Rent', icon: '🟣' },
                { value: 'sale', label: 'Sale Only', icon: '🔴' },
                { value: 'rent', label: 'Rent Only', icon: '🔵' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="dealType"
                    value={option.value}
                    checked={tempFilters.dealType === option.value}
                    onChange={(e) => handleTextChange('dealType', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 font-medium">{option.icon} {option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Minimum Price (Rs)</label>
                <input
                  type="number"
                  placeholder="Min price"
                  value={tempFilters.priceMin || ''}
                  onChange={(e) => handleTextChange('priceMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Maximum Price (Rs)</label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={tempFilters.priceMax || ''}
                  onChange={(e) => handleTextChange('priceMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rent Range Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rent Range 🏠</h3>
            <p className="text-xs text-gray-500 mb-3">Filter properties available for rent by monthly rent price</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Minimum Rent (Rs/month)</label>
                <input
                  type="number"
                  placeholder="Min rent"
                  value={tempFilters.rentMin || ''}
                  onChange={(e) => handleTextChange('rentMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Maximum Rent (Rs/month)</label>
                <input
                  type="number"
                  placeholder="Max rent"
                  value={tempFilters.rentMax || ''}
                  onChange={(e) => handleTextChange('rentMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={tempFilters.city || ''}
                  onChange={(e) => handleTextChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Area / Location</label>
                <input
                  type="text"
                  placeholder="Enter area or location"
                  value={tempFilters.location || ''}
                  onChange={(e) => handleTextChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
          <button
            onClick={handleApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition"
          >
            ✓ Apply Filters
          </button>
          <button
            onClick={handleClear}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
          >
            ↻ Clear Filters
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold transition lg:hidden"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default PropertyFilterPanel;
