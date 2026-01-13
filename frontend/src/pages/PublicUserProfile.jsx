import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { User, Phone, Mail, MapPin, Loader2, Calendar, ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import PropertyCard from '../components/public/PropertyCard';
import Avatar from '../components/Avatar';

const PublicUserProfile = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch User Profile
        const userRes = await axiosInstance.get(`/public/users/${id}`);
        setUser(userRes.data);

        // Fetch User Properties
        const propRes = await axiosInstance.get(`/public/properties/user/${id}`);
        setProperties(propRes.data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Profile Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="border-4 border-white shadow-lg shrink-0">
              <Avatar user={user} size="2xl" />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.full_name}</h1>
              <p className="text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-2">
                 <Calendar size={16} /> Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
              
              {user.bio && (
                <p className="text-gray-600 max-w-2xl mb-6">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {user.phone && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-gray-700">
                    <Phone size={18} className="text-blue-500" />
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-gray-700">
                    <Mail size={18} className="text-blue-500" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {user.role === 'agent' ? 'Active Listings' : 'Properties Listed'} ({properties.length})
        </h2>

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No active properties</h3>
            <p className="text-gray-600">This user hasn't listed any properties for sale or rent yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default PublicUserProfile;
