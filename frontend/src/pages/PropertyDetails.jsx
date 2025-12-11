import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Home } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const [propertyRes, historyRes] = await Promise.all([
          axiosInstance.get(`/properties/${id}`),
          axiosInstance.get(`/person-property-roles/property/${id}/history`),
        ]);

        setProperty(propertyRes.data);
        setOwnershipHistory(historyRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Property not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Property Details</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Location</label>
                  <p className="text-gray-900">{property.location}, {property.city}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Area Size</label>
                  <p className="text-gray-900">{property.area_size}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Bedrooms</label>
                    <p className="text-gray-900">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Bathrooms</label>
                    <p className="text-gray-900">{property.bathrooms || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Price</label>
                  <p className="text-lg font-bold text-blue-600">
                    Rs. {parseFloat(property.price).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Purpose</label>
                  <p className="text-gray-900">
                    {property.purpose.charAt(0).toUpperCase() + property.purpose.slice(1)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'sold'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
              </div>

              {property.description && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-sm text-gray-600 font-medium">Description</label>
                  <p className="text-gray-700 mt-2">{property.description}</p>
                </div>
              )}
            </div>

            {/* Current Owner & Tenant */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Current Information</h3>

              {property.current_owner && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-blue-600" />
                    <label className="text-sm text-gray-600 font-medium">Current Owner</label>
                  </div>
                  <div className="bg-blue-50 rounded p-3">
                    <p className="font-medium text-gray-900">{property.current_owner.Person?.full_name}</p>
                    <p className="text-sm text-gray-600">{property.current_owner.Person?.phone}</p>
                  </div>
                </div>
              )}

              {property.current_tenant ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-green-600" />
                    <label className="text-sm text-gray-600 font-medium">Current Tenant</label>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="font-medium text-gray-900">{property.current_tenant.Person?.full_name}</p>
                    <p className="text-sm text-gray-600">{property.current_tenant.Person?.phone}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Current Tenant</label>
                  <p className="text-gray-500 italic">No tenant</p>
                </div>
              )}
            </div>
          </div>

          {/* Ownership History Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ownership History</h2>

              {ownershipHistory.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-300"></div>

                  {/* Timeline items */}
                  <div className="space-y-6">
                    {ownershipHistory.map((record, index) => {
                      const isCurrentOwner = !record.end_date;
                      const startDate = new Date(record.start_date || record.createdAt);
                      const endDate = record.end_date ? new Date(record.end_date) : null;

                      return (
                        <div key={record.role_id} className="relative pl-20">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 w-14 h-14 rounded-full flex items-center justify-center border-4 border-white ${
                            isCurrentOwner ? 'bg-blue-600' : 'bg-gray-400'
                          }`}>
                            <Home size={24} className="text-white" />
                          </div>

                          {/* Card */}
                          <div className={`rounded-lg p-4 ${
                            isCurrentOwner ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900">{record.Person?.full_name}</h3>
                              {isCurrentOwner && (
                                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                                  Current Owner
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{record.Person?.phone}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>From: {startDate.toLocaleDateString()}</span>
                              </div>
                              {endDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar size={16} />
                                  <span>To: {endDate.toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {!endDate && (
                              <div className="mt-3 text-xs text-blue-600 font-medium">
                                → Still owns this property
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No ownership history found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
