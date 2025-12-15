import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Home, Users, Key } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import ImageCarousel from '../components/ImageCarousel';
import axiosInstance from '../api/axiosInstance';

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
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!person) {
    return <MainLayout><div className="text-center py-12">Person not found</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold">Person Details</h1>
            <div className="w-20"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{person.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold">{person.full_name}</h2>
                    <p className="text-sm text-gray-500">ID: {person.person_id}</p>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  {person.phone && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone size={16} className="text-blue-600" />
                        <label className="text-sm text-gray-600 font-medium">Phone</label>
                      </div>
                      <p>{person.phone}</p>
                    </div>
                  )}

                  {person.email && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={16} className="text-blue-600" />
                        <label className="text-sm text-gray-600 font-medium">Email</label>
                      </div>
                      <p>{person.email}</p>
                    </div>
                  )}

                  {person.national_id && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-blue-600" />
                        <label className="text-sm text-gray-600 font-medium">National ID</label>
                      </div>
                      <p>{person.national_id}</p>
                    </div>
                  )}

                  {person.address && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-blue-600" />
                        <label className="text-sm text-gray-600 font-medium">Address</label>
                      </div>
                      <p>{person.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {rentedProperty && (
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-4">
                    <Key size={24} className="text-green-600" />
                    <h2 className="text-xl font-bold">Currently Renting</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600 font-medium block mb-1">Property Type</label>
                        <p className="font-semibold">🏠 {rentedProperty.property_type?.charAt(0).toUpperCase() + rentedProperty.property_type?.slice(1)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 font-medium block mb-1">Location</label>
                        <p>📍 {rentedProperty.location}, {rentedProperty.city}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 font-medium block mb-1">Price</label>
                        <p className="text-lg font-bold text-green-600">Rs {parseFloat(rentedProperty.price).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 font-medium block mb-1">Bedrooms</label>
                        <p>{rentedProperty.bedrooms || 'N/A'}</p>
                      </div>
                    </div>

                    {rentedProperty.current_owner && (
                      <div className="bg-blue-50 rounded p-4 border border-blue-200">
                        <p className="text-sm text-gray-600 font-medium mb-2">Owner</p>
                        <p className="font-semibold">👤 {rentedProperty.current_owner.Person?.full_name}</p>
                        <p className="text-sm text-gray-600">{rentedProperty.current_owner.Person?.phone}</p>
                      </div>
                    )}

                    <button onClick={() => navigate(`/property-details/${rentedProperty.property_id}`)} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                      View Property Details
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Home size={24} className="text-blue-600" />
                  <h2 className="text-xl font-bold">Owned Properties ({ownedProperties.length})</h2>
                </div>

                {ownedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownedProperties.map(property => (
                      <div key={property.property_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg cursor-pointer" onClick={() => navigate(`/property-details/${property.property_id}`)}>
                        {property.photos && property.photos.length > 0 ? (
                          <div className="h-32 bg-gray-200"><ImageCarousel images={property.photos} title="Photos" /></div>
                        ) : (
                          <div className="h-32 bg-gray-300 flex items-center justify-center"><Home size={32} className="text-gray-400" /></div>
                        )}

                        <div className="p-4">
                          <h3 className="font-bold mb-2">🏠 {property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1)}</h3>
                          <p className="text-sm text-gray-600 mb-3">📍 {property.location}, {property.city}</p>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500">Price</p>
                              <p className="font-semibold">Rs {parseFloat(property.price).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Beds</p>
                              <p className="font-semibold">{property.bedrooms || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Home size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No properties owned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PersonDetails;
