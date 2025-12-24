import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { MapPin, Bed, Bath, Square, User, Phone, Mail, Calendar, Share2, Heart, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ImageCarousel from '../components/ImageCarousel';
import authStore from '../stores/AuthStore';

const PublicPropertyDetails = observer(() => {
  const { id } = useParams();
  const { openLogin } = useOutletContext();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axiosInstance.get(`/public/properties/${id}`);
        setProperty(response.data);
      } catch (err) {
        setError('Failed to load property details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600">{error || 'Property not found'}</p>
        </div>
      </div>
    );
  }

  const {
    property_type,
    purpose,
    sale_price,
    rent_price,
    location,
    city,
    bedrooms,
    bathrooms,
    area_size,
    description,
    photos,
    current_owner,
    created_at
  } = property;

  const price = purpose === 'SALE' ? sale_price : rent_price;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Breadcrumb could go here */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Carousel */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ImageCarousel images={photos} title={property_type} />
            </div>

            {/* Key Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                      purpose === 'SALE' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      For {purpose}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Listed {new Date(created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property_type} in {city}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-1 text-blue-500" />
                    {location}, {city}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formattedPrice}
                    {purpose === 'RENT' && <span className="text-lg font-normal text-gray-500">/mo</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bed size={24} className="mx-auto text-blue-500 mb-2" />
                  <div className="font-bold text-gray-900">{bedrooms || 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bath size={24} className="mx-auto text-blue-500 mb-2" />
                  <div className="font-bold text-gray-900">{bathrooms || 0}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Square size={24} className="mx-auto text-blue-500 mb-2" />
                  <div className="font-bold text-gray-900">{area_size}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Area Size</div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {description || 'No description available.'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            {/* Owner Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Owner</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {current_owner?.full_name?.charAt(0) || <User size={32} />}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{current_owner?.full_name || 'Property Owner'}</div>
                  <div className="text-gray-500 text-sm">Property Owner</div>
                </div>
              </div>

              {authStore.isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-blue-500" />
                    <span className="font-medium">{current_owner?.phone || 'No phone available'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-blue-500" />
                    <span className="font-medium">{current_owner?.email || 'No email available'}</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    Send Message
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                  <div className="mb-3 text-gray-500">
                    <User size={32} className="mx-auto opacity-50" />
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">Log in to view contact details</p>
                  <button 
                    onClick={openLogin}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Log In to View
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                  <Heart size={18} /> Save
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default PublicPropertyDetails;
