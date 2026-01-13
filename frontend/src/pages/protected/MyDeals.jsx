import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Loader2, FileText, Calendar, DollarSign, User, ChevronRight, Eye, FileCheck, X, Filter } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const MyDeals = observer(() => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    dealId: '',
    dealType: '',
    buyerName: '',
    buyerNationalId: '',
    sellerName: '',
    status: '',
    priceFrom: '',
    priceTo: ''
  });

  const fetchDeals = async () => {
    try {
      const response = await axiosInstance.get('/deals');
      setDeals(response.data);
      setFilteredDeals(response.data);
    } catch (error) {
      console.error('Failed to fetch deals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const applyFilters = (updatedFilters = filters) => {
    let filtered = deals;

    if (updatedFilters.dealId.trim()) {
      filtered = filtered.filter(deal => 
        deal.deal_id.toString().includes(updatedFilters.dealId.trim())
      );
    }

    if (updatedFilters.dealType) {
      filtered = filtered.filter(deal => deal.deal_type === updatedFilters.dealType);
    }

    if (updatedFilters.buyerName.trim()) {
      const searchTerm = updatedFilters.buyerName.trim().toLowerCase();
      filtered = filtered.filter(deal => {
        const buyerName = (deal.buyer_name_snapshot || deal.Buyer?.full_name || '').toLowerCase();
        return buyerName.includes(searchTerm);
      });
    }

    if (updatedFilters.buyerNationalId.trim()) {
      filtered = filtered.filter(deal => 
        (deal.Buyer?.national_id_number || '').includes(updatedFilters.buyerNationalId.trim())
      );
    }

    if (updatedFilters.sellerName.trim()) {
      const searchTerm = updatedFilters.sellerName.trim().toLowerCase();
      filtered = filtered.filter(deal => {
        const sellerName = (deal.seller_name_snapshot || deal.Seller?.full_name || '').toLowerCase();
        return sellerName.includes(searchTerm);
      });
    }

    if (updatedFilters.status) {
      filtered = filtered.filter(deal => deal.status === updatedFilters.status);
    }

    if (updatedFilters.priceFrom) {
      const minPrice = parseFloat(updatedFilters.priceFrom);
      filtered = filtered.filter(deal => deal.price >= minPrice);
    }

    if (updatedFilters.priceTo) {
      const maxPrice = parseFloat(updatedFilters.priceTo);
      filtered = filtered.filter(deal => deal.price <= maxPrice);
    }

    setFilteredDeals(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({
      dealId: '',
      dealType: '',
      buyerName: '',
      buyerNationalId: '',
      sellerName: '',
      status: '',
      priceFrom: '',
      priceTo: ''
    });
    setFilteredDeals(deals);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="flex gap-6 h-full">
      {/* Main Content - Left Side */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
              showFilters 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            Showing <span className="font-bold text-gray-900">{filteredDeals.length}</span> of <span className="font-bold text-gray-900">{deals.length}</span> deals
          </div>
        )}

        {/* Deals List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {hasActiveFilters ? 'No deals match your filters' : 'No deals found'}
            </h3>
            <p className="text-gray-600">
              {hasActiveFilters ? 'Try adjusting your filter criteria' : "You haven't been involved in any deals yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDeals.map((deal) => (
              <div 
                key={deal.deal_id} 
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/authenticated/deals/${deal.deal_id}`)}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        deal.deal_type === 'SALE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {deal.deal_type}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {deal.Property?.property_type} in {deal.Property?.city}
                    </h3>
                    <p className="text-gray-600 mb-4">{deal.Property?.location}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>Owner/Seller: <span className="font-medium text-gray-900">{deal.seller_name_snapshot || deal.Seller?.full_name}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{deal.deal_type === 'SALE' ? 'Buyer' : 'Tenant'}: <span className="font-medium text-gray-900">{deal.buyer_name_snapshot || deal.Buyer?.full_name}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between min-w-fit gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/authenticated/deals/${deal.deal_id}/report`);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        title="View Printable Report"
                      >
                        <FileCheck size={16} />
                        View Report
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/authenticated/deals/${deal.deal_id}`);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                        Details
                      </button>
                    </div>
                    <div className="w-full">
                      <div className="text-2xl font-bold text-blue-600 flex items-center justify-end mb-2">
                        <DollarSign size={20} />
                        {new Intl.NumberFormat('en-US').format(deal.price)}
                      </div>
                      {deal.deal_type === 'RENT' && (
                        <div className="text-sm text-gray-500 text-right">
                          Start: {new Date(deal.start_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel - Right Side */}
      {showFilters && (
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  title="Clear all filters"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Deal ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deal ID</label>
                <input
                  type="text"
                  name="dealId"
                  value={filters.dealId}
                  onChange={handleFilterChange}
                  placeholder="e.g., 123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Deal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type</label>
                <select
                  name="dealType"
                  value={filters.dealType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="SALE">Sale</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>

              {/* Buyer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buyer / Tenant</label>
                <input
                  type="text"
                  name="buyerName"
                  value={filters.buyerName}
                  onChange={handleFilterChange}
                  placeholder="Search name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Buyer National ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buyer National ID</label>
                <input
                  type="text"
                  name="buyerNationalId"
                  value={filters.buyerNationalId}
                  onChange={handleFilterChange}
                  placeholder="Search ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Seller Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seller / Owner</label>
                <input
                  type="text"
                  name="sellerName"
                  value={filters.sellerName}
                  onChange={handleFilterChange}
                  placeholder="Search name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              {/* Price Range - From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price From</label>
                <input
                  type="number"
                  name="priceFrom"
                  value={filters.priceFrom}
                  onChange={handleFilterChange}
                  placeholder="Min price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Price Range - To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price To</label>
                <input
                  type="number"
                  name="priceTo"
                  value={filters.priceTo}
                  onChange={handleFilterChange}
                  placeholder="Max price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Active Filters Badge */}
              {hasActiveFilters && (
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Active filters:</div>
                  <div className="flex flex-wrap gap-2">
                    {filters.dealId && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        ID: {filters.dealId}
                        <button onClick={() => handleFilterChange({ target: { name: 'dealId', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.dealType && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {filters.dealType}
                        <button onClick={() => handleFilterChange({ target: { name: 'dealType', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.buyerName && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Buyer: {filters.buyerName}
                        <button onClick={() => handleFilterChange({ target: { name: 'buyerName', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.buyerNationalId && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Buyer ID: {filters.buyerNationalId}
                        <button onClick={() => handleFilterChange({ target: { name: 'buyerNationalId', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.sellerName && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Seller: {filters.sellerName}
                        <button onClick={() => handleFilterChange({ target: { name: 'sellerName', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.status && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {filters.status}
                        <button onClick={() => handleFilterChange({ target: { name: 'status', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.priceFrom && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        From: ${filters.priceFrom}
                        <button onClick={() => handleFilterChange({ target: { name: 'priceFrom', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {filters.priceTo && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        To: ${filters.priceTo}
                        <button onClick={() => handleFilterChange({ target: { name: 'priceTo', value: '' } })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MyDeals;
