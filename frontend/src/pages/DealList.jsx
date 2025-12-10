import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DealStore from '../stores/DealStore';
import useViewPreference from '../hooks/useViewPreference';

const DealList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('deals');

  useEffect(() => {
    DealStore.fetchDeals();
  }, []);

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Deals</h1>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 bg-gray-200 rounded p-1">
              <button
                onClick={() => toggleView('list')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                ☰ List
              </button>
              <button
                onClick={() => toggleView('card')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⊞ Grid
              </button>
            </div>
            <button onClick={() => navigate('/deals/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Add Deal
            </button>
          </div>
        </div>

        {DealStore.loading ? (
          <p>Loading...</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Deal ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Property</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">Final Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Deal Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {DealStore.deals.map(deal => (
                  <tr key={deal.deal_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{deal.deal_id}</td>
                    <td className="px-4 py-3">{deal.property_type} - {deal.location}</td>
                    <td className="px-4 py-3">{deal.client_name}</td>
                    <td className="px-4 py-3">Rs {deal.final_price}</td>
                    <td className="px-4 py-3">{deal.deal_type}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-white text-xs font-semibold bg-green-500">
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(deal.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DealStore.deals.map(deal => (
              <div key={deal.deal_id} className="bg-white shadow-md rounded p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Deal #{deal.deal_id}</h3>
                    <p className="text-sm text-gray-600">{deal.deal_type}</p>
                  </div>
                  <span className="px-3 py-1 rounded text-white text-xs font-semibold bg-green-500">
                    {deal.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <p className="text-gray-600"><strong>Property:</strong> {deal.property_type} - {deal.location}</p>
                  <p className="text-gray-600"><strong>Client:</strong> {deal.client_name}</p>
                  <p className="text-gray-600"><strong>Final Price:</strong> Rs {deal.final_price}</p>
                  <p className="text-gray-600"><strong>Date:</strong> {new Date(deal.date).toLocaleDateString()}</p>
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
