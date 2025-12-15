import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PersonStore from '../stores/PersonStore';

const DealFilterPanel = ({ isOpen, onClose, filters, onApplyFilters, onClearFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    PersonStore.fetchPersons();
  }, []);

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
      dealType: 'both',
      owner: '',
      buyer: '',
      priceMin: '',
      priceMax: '',
      status: '',
      dateFrom: '',
      dateTo: ''
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
          <h2 className="text-xl font-bold text-gray-800">🔍 Deal Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Deal Type Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Deal Type</h3>
            <div className="space-y-3">
              {[
                { value: 'both', label: 'Both Sale & Rent', icon: '🟣' },
                { value: 'SALE', label: 'Sale Only', icon: '🔴' },
                { value: 'RENT', label: 'Rent Only', icon: '🔵' }
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

          {/* Owner Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Owner</h3>
            <select
              value={tempFilters.owner || ''}
              onChange={(e) => handleTextChange('owner', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Owners</option>
              {PersonStore.persons.map(person => (
                <option key={person.person_id} value={person.person_id}>
                  👤 {person.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer/Tenant Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Buyer / Tenant</h3>
            <select
              value={tempFilters.buyer || ''}
              onChange={(e) => handleTextChange('buyer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Buyers/Tenants</option>
              {PersonStore.persons.map(person => (
                <option key={person.person_id} value={person.person_id}>
                  👤 {person.full_name}
                </option>
              ))}
            </select>
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

          {/* Date Range Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Date Range 📅</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">From Date</label>
                <input
                  type="date"
                  value={tempFilters.dateFrom || ''}
                  onChange={(e) => handleTextChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">To Date</label>
                <input
                  type="date"
                  value={tempFilters.dateTo || ''}
                  onChange={(e) => handleTextChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
            <select
              value={tempFilters.status || ''}
              onChange={(e) => handleTextChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
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

export default DealFilterPanel;
