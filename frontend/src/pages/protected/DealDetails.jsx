import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { 
  Loader2, 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  User, 
  Calendar, 
  FileText, 
  Phone, 
  Home,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import ImageCarousel from '../../components/ImageCarousel';
import { getImageUrl } from '../../utils/mediaUtils';

const DealDetails = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDealDetails = async () => {
      try {
        const response = await axiosInstance.get(`/deals/${id}`);
        setDeal(response.data);
      } catch (err) {
        setError('Failed to load deal details');
        console.error('Error fetching deal:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDealDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !deal) {
    return (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/authenticated/deals')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
          >
            <ArrowLeft size={20} />
            Back to My Deals
          </button>
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-red-100">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">
              {error || 'Deal not found'}
            </p>
          </div>
        </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'active':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock };
      case 'canceled':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText };
    }
  };

  const getTypeColor = (dealType) => {
    return dealType === 'SALE' 
      ? { bg: 'bg-blue-100', text: 'text-blue-700' } 
      : { bg: 'bg-green-100', text: 'text-green-700' };
  };

  const statusInfo = getStatusColor(deal.status);
  const typeInfo = getTypeColor(deal.deal_type);
  const StatusIcon = statusInfo.icon;

  const propertyImages = deal.Property?.PropertyHistories?.map(h => h.image_url).filter(Boolean) || [];

  return (
    <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/authenticated/deals')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition font-medium"
        >
          <ArrowLeft size={20} />
          Back to My Deals
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <ImageCarousel 
                images={propertyImages} 
                title="Property Photos"
                autoSlide={true}
              />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {deal.Property?.property_type}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <MapPin size={18} className="text-blue-600" />
                      <span className="text-lg">
                        {deal.Property?.location}, {deal.Property?.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">Property Type</p>
                    <p className="text-xl font-bold text-blue-900">
                      {deal.Property?.property_type}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">Status</p>
                    <p className="text-xl font-bold text-gray-900">
                      {deal.Property?.status || 'Under Deal'}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mt-4">
                  {deal.Property?.description || 'No description available'}
                </p>
              </div>
            </div>

            {/* Deal Information Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Deal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Deal Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Deal Type
                  </label>
                  <div className={`${typeInfo.bg} ${typeInfo.text} rounded-lg px-4 py-3 font-bold text-center`}>
                    {deal.deal_type === 'SALE' ? '💼 SALE' : '🏠 RENT'}
                  </div>
                </div>

                {/* Deal Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Deal Status
                  </label>
                  <div className={`${statusInfo.bg} ${statusInfo.text} rounded-lg px-4 py-3 font-bold flex items-center justify-center gap-2`}>
                    <StatusIcon size={18} />
                    {deal.status?.toUpperCase()}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    {deal.deal_type === 'SALE' ? 'Sale Price' : 'Rental Price'}
                  </label>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={20} className="text-green-600" />
                      <span className="text-2xl font-bold text-green-700">
                        {new Intl.NumberFormat('en-US').format(deal.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deal Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Deal Created Date
                  </label>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-purple-600" />
                      <span className="text-lg font-semibold text-purple-900">
                        {new Date(deal.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates for Rental */}
              {deal.deal_type === 'RENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Lease Start Date
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <p className="font-semibold text-gray-900">
                        {deal.start_date 
                          ? new Date(deal.start_date).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Lease End Date
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <p className="font-semibold text-gray-900">
                        {deal.end_date 
                          ? new Date(deal.end_date).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {deal.notes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Notes & Remarks
                  </label>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg px-4 py-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Completion Info */}
            {deal.deal_completed_at && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={24} className="text-green-600" />
                  <h4 className="text-lg font-bold text-green-900">Deal Completed</h4>
                </div>
                <p className="text-green-700">
                  Completed on {new Date(deal.deal_completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Parties Information */}
          <div className="space-y-6">
            {/* Agent Information */}
            {deal.Agent && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Agent
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{deal.Agent.full_name}</p>
                  </div>
                  {deal.Agent.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a 
                        href={`mailto:${deal.Agent.email}`}
                        className="font-semibold text-blue-600 hover:text-blue-700 break-all"
                      >
                        {deal.Agent.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seller Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home size={20} className="text-amber-600" />
                {deal.deal_type === 'SALE' ? 'Owner' : 'Owner'}
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">
                    {deal.seller_name_snapshot || deal.Seller?.full_name || 'N/A'}
                  </p>
                </div>
                {(deal.seller_phone_snapshot || deal.Seller?.phone) && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a 
                      href={`tel:${deal.seller_phone_snapshot || deal.Seller?.phone}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Phone size={16} />
                      {deal.seller_phone_snapshot || deal.Seller?.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer/Tenant Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-green-600" />
                {deal.deal_type === 'SALE' ? 'Buyer' : 'Tenant'}
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">
                    {deal.buyer_name_snapshot || deal.Buyer?.full_name || 'N/A'}
                  </p>
                </div>
                {(deal.buyer_phone_snapshot || deal.Buyer?.phone) && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a 
                      href={`tel:${deal.buyer_phone_snapshot || deal.Buyer?.phone}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Phone size={16} />
                      {deal.buyer_phone_snapshot || deal.Buyer?.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <h4 className="text-lg font-bold mb-4">Deal Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">Type:</span>
                  <span className="font-semibold">{deal.deal_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Status:</span>
                  <span className="font-semibold capitalize">{deal.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Amount:</span>
                  <span className="font-semibold">
                    ${new Intl.NumberFormat('en-US').format(deal.price || 0)}
                  </span>
                </div>
                <hr className="border-blue-500" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Value:</span>
                  <span>
                    ${new Intl.NumberFormat('en-US').format(deal.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
});

export default DealDetails;
