import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Home, Users, Key, Calendar, FileText, ExternalLink, ShieldCheck, Upload } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getImageUrl, getFileUrl } from '../utils/mediaUtils';
import Avatar from '../components/Avatar';

const PersonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [rentedProperty, setRentedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPersonDetails = async () => {
      try {
        setLoading(true);
        const [personRes, ownedRes, rentedRes] = await Promise.all([
          axiosInstance.get(`/persons/${id}`),
          axiosInstance.get(`/properties/owner/${id}`),
          axiosInstance.get(`/properties/tenant/${id}`),
        ]);

        setPerson(personRes.data);
        setOwnedProperties(ownedRes.data || []);
        setRentedProperty(rentedRes.data?.length > 0 ? rentedRes.data[0] : null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors w-fit"
        >
          <ArrowLeft size={20} /> Back to Persons
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/authenticated/persons/edit/${id}`)}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-700"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg p-1.5 border-4 border-white">
                  <Avatar user={person} size="lg" />
                </div>
                {person.id_card_path && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white text-white p-1 rounded-full" title="ID Verified">
                    <ShieldCheck size={16} />
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{person.full_name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-xs">ID: #{person.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(person.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <Phone size={18} className="text-blue-600" /> {person.phone}
                  </div>
                </div>
                {person.email && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <Mail size={18} className="text-blue-600" /> {person.email}
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">National ID</label>
                  <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <FileText size={18} className="text-blue-600" /> {person.national_id}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                  <div className="flex items-start gap-3 text-gray-700 font-medium">
                    <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" /> {person.address || 'No address provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ID Card Document */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" /> Identity Document
            </h3>
            {person.id_card_path ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative group overflow-hidden">
                  {person.id_card_path.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={getImageUrl(person.id_card_path)} 
                      alt="ID Card" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText size={48} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Document File</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={getFileUrl(person.id_card_path)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-blue-600 p-3 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300"
                    >
                      <ExternalLink size={24} />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400 font-medium">Click to view full-size document</p>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No ID card uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Activities Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Current Lease Activity */}
          {rentedProperty && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-600 px-8 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Key size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">Active Rental Agreement</span>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Active</span>
              </div>
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl bg-gray-100 overflow-hidden">
                    {rentedProperty.photos?.[0] ? (
                      <img src={getImageUrl(rentedProperty.photos[0])} alt="Property" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={40} /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{rentedProperty.property_type} in {rentedProperty.city}</h4>
                      <p className="text-gray-500 flex items-center gap-1 text-sm"><MapPin size={14} /> {rentedProperty.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Rent</label>
                        <p className="text-xl font-bold text-green-600">Rs {parseFloat(rentedProperty.rent_price).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Managed By</label>
                        <p className="font-bold text-gray-800">{rentedProperty.Agent?.full_name || 'System'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/properties/${rentedProperty.property_id}`)}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                      View Lease Agreement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Owned Properties Portfolio */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Home size={28} className="text-blue-600" /> Owned Properties Portfolio
              </h3>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {ownedProperties.length} Listings
              </span>
            </div>

            {ownedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ownedProperties.map(property => (
                  <div 
                    key={property.property_id} 
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-50 transition-all group cursor-pointer"
                    onClick={() => navigate(`/properties/${property.property_id}`)}
                  >
                    <div className="h-48 bg-gray-100 relative">
                      {property.photos?.[0] ? (
                        <img src={getImageUrl(property.photos[0])} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={40} /></div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {property.purpose}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{property.property_type}</h4>
                        <span className="text-lg font-black text-blue-600">
                          Rs {parseFloat(property.purpose === 'Sale' ? property.sale_price : property.rent_price).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><MapPin size={14} /> {property.city}, {property.location}</p>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 border-t border-gray-50 pt-4">
                        <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">{property.area_size}</span>
                        {property.bedrooms && <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">{property.bedrooms} Beds</span>}
                        <span className={`ml-auto px-2.5 py-1 rounded-lg uppercase tracking-tighter ${
                          property.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>{property.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No properties listed</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  This person hasn't listed any properties for sale or rent yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;
