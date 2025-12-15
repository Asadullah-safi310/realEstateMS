import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Home, MapPin } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import PhotoViewer from '../components/PhotoViewer';
import { VideoPlayer, VideoThumbnail } from '../components/VideoPlayer';
import ConfirmDialog from '../components/ConfirmDialog';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingFile, setDeletingFile] = useState(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, fileUrl: null, type: null });

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

  const handleDeleteFile = (fileUrl, type) => {
    setConfirmDialog({ isOpen: true, fileUrl, type });
  };

  const confirmDeleteFile = async () => {
    const { fileUrl, type } = confirmDialog;
    setConfirmDialog({ isOpen: false, fileUrl: null, type: null });
    
    setDeletingFile(fileUrl);
    try {
      await axiosInstance.delete(`/properties/${id}/file`, {
        data: { fileUrl, type },
      });

      setProperty(prev => {
        if (type === 'photo') {
          return {
            ...prev,
            photos: (prev.photos || []).filter(p => p !== fileUrl),
          };
        } else if (type === 'video') {
          return {
            ...prev,
            videos: (prev.videos || []).filter(v => v !== fileUrl),
          };
        } else if (type === 'attachment') {
          return {
            ...prev,
            attachments: (prev.attachments || []).filter(a => a !== fileUrl),
          };
        }
        return prev;
      });
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    } finally {
      setDeletingFile(null);
    }
  };

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

  const currentOwnerRecord = ownershipHistory.find(record => !record.end_date);
  const previousOwners = ownershipHistory.filter(record => record.end_date);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                </h2>
                {property.latitude && property.longitude && (
                  <a
                    href={`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                    title={`${property.latitude}, ${property.longitude}`}
                  >
                    <MapPin size={20} />
                  </a>
                )}
              </div>

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

                {property.is_available_for_sale && (
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Sale Price</label>
                    <p className="text-lg font-bold text-blue-600">
                      Rs. {parseFloat(property.sale_price).toLocaleString()}
                    </p>
                  </div>
                )}

                {property.is_available_for_rent && (
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Rent Price</label>
                    <p className="text-lg font-bold text-green-600">
                      Rs. {parseFloat(property.rent_price).toLocaleString()}
                    </p>
                  </div>
                )}

                {(property.is_available_for_sale || property.is_available_for_rent) && (
                  <div className="flex flex-wrap gap-2">
                    {property.is_available_for_sale && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">For Sale</span>
                    )}
                    {property.is_available_for_rent && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">For Rent</span>
                    )}
                  </div>
                )}

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

          <div className="lg:col-span-2">
            {property.is_photo_available && property.photos && property.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📸 Photos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative bg-gray-100 rounded-lg h-48 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={`http://localhost:5000${photo}`}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onClick={() => {
                          setSelectedPhotoIndex(index);
                          setPhotoViewerOpen(true);
                        }}
                      />
                      <button
                        onClick={() => handleDeleteFile(photo, 'photo')}
                        disabled={deletingFile === photo}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10"
                        title="Delete photo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.attachments && property.attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📎 Attachments</h2>
                <div className="space-y-2">
                  {property.attachments.map((attachment, index) => {
                    const fileName = attachment.split('/').pop();
                    const fileType = fileName.split('.').pop().toUpperCase();
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">
                            {fileType}
                          </span>
                          <span className="text-sm text-gray-700">{fileName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`http://localhost:5000${attachment}`}
                            download
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDeleteFile(attachment, 'attachment')}
                            disabled={deletingFile === attachment}
                            className="text-red-600 hover:text-red-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            title="Delete attachment"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {property.is_video_available && property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🎥 Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.videos.map((video, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <VideoThumbnail
                        video={video}
                        onClick={() => {
                          setSelectedVideoIndex(index);
                          setVideoPlayerOpen(true);
                        }}
                      />
                      <button
                        onClick={() => handleDeleteFile(video, 'video')}
                        disabled={deletingFile === video}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10"
                        title="Delete video"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-base font-bold text-gray-900 mb-4">Ownership History</h3>
            
            {ownershipHistory && ownershipHistory.length > 0 ? (
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-2 min-w-max px-1">
                  {previousOwners.map((record, idx) => {
                    const startDate = new Date(record.start_date);
                    const endDate = new Date(record.end_date);
                    const initials = record.Person?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="group">
                          <div className="flex flex-col items-center cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition transform hover:scale-110">
                              {initials}
                            </div>
                            <p className="text-xs font-semibold text-gray-700 mt-1 text-center whitespace-nowrap">
                              {record.Person?.full_name?.split(' ')[0] || 'Owner'}
                            </p>
                            <div className="invisible group-hover:visible absolute bg-gray-800 text-white text-xs rounded py-2 px-2 whitespace-nowrap z-10 bottom-12 -translate-x-1/2 left-1/2">
                              <p className="font-semibold">{record.Person?.full_name}</p>
                              <p className="text-gray-300">{record.Person?.phone}</p>
                              <p className="text-gray-400 mt-1">
                                {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} → {endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <svg width="50" height="24" viewBox="0 0 50 24" fill="none">
                          <path d="M 2 12 Q 25 4, 48 12" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
                          <path d="M 2 12 Q 25 4, 48 12" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4,3" />
                          <circle cx="48" cy="12" r="3" fill="#10b981" opacity="0.4" />
                          <polygon points="48,12 44,10 46,12 44,14" fill="#10b981" />
                        </svg>
                      </div>
                    );
                  })}

                  {currentOwnerRecord && (
                    <div className="group ml-4">
                      <div className="flex flex-col items-center cursor-pointer">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition animate-pulse"></div>
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-2xl transition transform hover:scale-115 border-4 border-white">
                            {currentOwnerRecord.Person?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-sm font-bold text-gray-900 whitespace-normal">
                            {currentOwnerRecord.Person?.full_name}
                          </p>
                          <div className="inline-block mt-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                            ★ Current Owner
                          </div>
                        </div>
                        <div className="invisible group-hover:visible absolute bg-gray-900 text-white text-xs rounded-lg py-3 px-3 z-20 bottom-32 -translate-x-1/2 left-1/2 shadow-2xl border border-emerald-500">
                          <p className="font-bold text-emerald-300">{currentOwnerRecord.Person?.full_name}</p>
                          <p className="text-gray-300 mt-1">{currentOwnerRecord.Person?.phone}</p>
                          <p className="text-emerald-300 mt-2 font-semibold">
                            Since {new Date(currentOwnerRecord.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Home size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No ownership history</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PhotoViewer
        photos={property.photos || []}
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        initialIndex={selectedPhotoIndex}
      />

      <VideoPlayer
        videos={property.videos || []}
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        initialIndex={selectedVideoIndex}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete File"
        message={`Are you sure you want to delete this ${confirmDialog.type}? This action cannot be undone.`}
        onConfirm={confirmDeleteFile}
        onCancel={() => setConfirmDialog({ isOpen: false, fileUrl: null, type: null })}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
};

export default PropertyDetails;
