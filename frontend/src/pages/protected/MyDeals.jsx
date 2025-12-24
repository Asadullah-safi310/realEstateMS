import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Loader2, FileText, Calendar, DollarSign, User } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const MyDeals = observer(() => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axiosInstance.get('/deals');
        setDeals(response.data);
      } catch (error) {
        console.error('Failed to fetch deals', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Deals</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600">You haven't been involved in any deals yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {deals.map((deal) => (
              <div key={deal.deal_id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
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
                        <span>Owner: <span className="font-medium text-gray-900">{deal.Owner?.full_name}</span></span>
                      </div>
                      {deal.Buyer && (
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span>Buyer: <span className="font-medium text-gray-900">{deal.Buyer?.full_name}</span></span>
                        </div>
                      )}
                      {deal.Tenant && (
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span>Tenant: <span className="font-medium text-gray-900">{deal.Tenant?.full_name}</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-end min-w-[150px]">
                    <div className="text-2xl font-bold text-blue-600 flex items-center">
                      <DollarSign size={20} />
                      {new Intl.NumberFormat('en-US').format(deal.price)}
                    </div>
                    {deal.deal_type === 'RENT' && (
                      <div className="text-sm text-gray-500 mt-1">
                        Start: {new Date(deal.start_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
});

export default MyDeals;
