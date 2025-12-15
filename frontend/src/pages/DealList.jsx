import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import DealStore from '../stores/DealStore';
import DealFilterPanel from '../components/DealFilterPanel';
import useViewPreference from '../hooks/useViewPreference';

const DealList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('deals');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    dealType: 'both',
    owner: '',
    buyer: '',
    priceMin: '',
    priceMax: '',
    status: ''
  });

  useEffect(() => {
    DealStore.fetchDeals();
  }, []);

  const getFilteredDeals = () => {
    let filtered = DealStore.deals || [];

    const { dealType, owner, buyer, priceMin, priceMax, status } = appliedFilters;

    if (dealType !== 'both') {
      filtered = filtered.filter(deal => deal.deal_type === dealType);
    }

    if (owner) {
      filtered = filtered.filter(deal => deal.owner_id === parseInt(owner));
    }

    if (buyer) {
      filtered = filtered.filter(deal => deal.buyer_id === parseInt(buyer));
    }

    if (priceMin) {
      filtered = filtered.filter(deal => {
        const price = parseFloat(deal.price) || 0;
        return price >= parseFloat(priceMin);
      });
    }

    if (priceMax) {
      filtered = filtered.filter(deal => {
        const price = parseFloat(deal.price) || 0;
        return price <= parseFloat(priceMax);
      });
    }

    if (status) {
      filtered = filtered.filter(deal => deal.status.toLowerCase() === status.toLowerCase());
    }

    return filtered;
  };

  const filteredDeals = getFilteredDeals();

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setIsFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setAppliedFilters({
      dealType: 'both',
      owner: '',
      buyer: '',
      priceMin: '',
      priceMax: '',
      status: ''
    });
    setIsFilterPanelOpen(false);
  };

  return (
    <MainLayout>
      <DealFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Deals</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                <Filter size={18} />
                Filters
              </button>
              <div className="flex gap-2 bg-gray-100 rounded p-1">
                <button
                  onClick={() => toggleView('list')}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    viewType === 'list'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-300'
                      : 'bg-transparent text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ☰ List
                </button>
                <button
                  onClick={() => toggleView('card')}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    viewType === 'card'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-300'
                      : 'bg-transparent text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⊞ Grid
                </button>
              </div>
              <button onClick={() => navigate('/create-deal')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition">
                ➕ Create Deal
              </button>
            </div>
          </div>
        </div>

        {DealStore.loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-white rounded shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No deals found matching your filters</p>
          </div>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-visible">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Deal ID</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Property</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Owner</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Buyer/Tenant</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal, idx) => (
                  <tr key={deal.deal_id} className={`border-t hover:bg-green-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-4 font-semibold text-gray-800"># {deal.deal_id}</td>
                    <td className="px-4 py-4 text-gray-600">🏠 {deal.DealProperty?.property_type} - {deal.DealProperty?.location}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-3 py-1 rounded text-white text-xs font-semibold ${deal.deal_type === 'SALE' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {deal.deal_type === 'SALE' ? '🔴 Sale' : '🔵 Rent'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">👤 {deal.Owner?.full_name}</td>
                    <td className="px-4 py-4 text-gray-600">{deal.Buyer?.full_name || '-'}</td>
                    <td className="px-4 py-4 font-medium text-gray-800">💰 Rs {deal.price ? parseFloat(deal.price).toLocaleString() : '-'}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-3 py-1 rounded text-white text-xs font-semibold bg-green-600">
                        ✅ {deal.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-xs">📅 {new Date(deal.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map(deal => (
              <div key={deal.deal_id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">📋 Deal #{deal.deal_id}</h3>
                    <span className={`inline-block text-xs font-semibold mt-1 px-2 py-1 rounded ${
                      deal.deal_type === 'SALE' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {deal.deal_type}
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded text-white text-xs font-semibold bg-green-600">
                    {deal.status}
                  </span>
                </div>
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">🏠</span>
                    <span className="text-gray-600">{deal.DealProperty?.property_type} - {deal.DealProperty?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">👤</span>
                    <span className="text-gray-600"><strong>Owner:</strong> {deal.Owner?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">🤝</span>
                    <span className="text-gray-600"><strong>Buyer/Tenant:</strong> {deal.Buyer?.full_name || '-'}</span>
                  </div>
                  {deal.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">💰</span>
                      <span className="text-gray-600"><strong>Price:</strong> Rs {parseFloat(deal.price).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">📅</span>
                    <span className="text-gray-600">{new Date(deal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
});

export default DealList;
