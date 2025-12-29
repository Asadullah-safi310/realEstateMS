import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { MapPin, Bed, Bath, Square, User, Phone, Mail, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ImageCarousel from '../components/ImageCarousel';
import authStore from '../stores/AuthStore';

const PublicPropertyDetails = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    property_id,
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
    Agent,
    Creator,
    created_at
  } = property;

  const price = purpose === 'SALE' ? sale_price : rent_price;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);

  const ProfileSection = ({ title, user, type }) => {
    if (!user) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to={`/user/${user.user_id}`}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden hover:opacity-80 transition-opacity"
          >
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user.full_name?.charAt(0) || <User size={32} />
            )}
          </Link>
          <div>
            <Link 
              to={`/user/${user.user_id}`}
              className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors"
            >
              {user.full_name}
            </Link>
            <div className="text-gray-500 text-sm">{type}</div>
          </div>
        </div>

        {authStore.isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700 p-2.5 bg-gray-50 rounded-lg text-sm">
              <Phone size={16} className="text-blue-500" />
              <span className="font-medium">{user.phone || 'No phone available'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 p-2.5 bg-gray-50 rounded-lg text-sm">
              <Mail size={16} className="text-blue-500" />
              <span className="font-medium truncate">{user.email || 'No email available'}</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
            <p className="text-xs text-gray-600 mb-2">Log in to view contact details</p>
            <button 
              onClick={openLogin}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Breadcrumb could go here */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

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
          <div className="space-y-0">
            {/* Agent Section */}
            <ProfileSection 
              title="Listing Agent" 
              user={Agent} 
              type="Verified Agent" 
            />

            {/* Creator Section */}
            <ProfileSection 
              title="Property Creator" 
              user={Creator} 
              type="Listing Source" 
            />

            {/* Internal Information (Visible to Agents/Admins only) */}
            {authStore.isAuthenticated && (authStore.user?.role === 'agent' || authStore.user?.role === 'admin') && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Internal Details
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="text-[10px] text-gray-400 text-center">
                    Listing ID: #{property_id}
                  </div>
                  <div className="text-[10px] text-gray-400 text-center">
                    Database ID: {property.property_id}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default PublicPropertyDetails;
