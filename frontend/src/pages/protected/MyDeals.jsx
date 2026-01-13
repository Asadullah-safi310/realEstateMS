import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Loader2, FileText, Calendar, DollarSign, User, ChevronRight, Eye, FileCheck } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const MyDeals = observer(() => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
  );
});

export default MyDeals;
