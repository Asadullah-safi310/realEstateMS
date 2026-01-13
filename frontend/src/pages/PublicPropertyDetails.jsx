import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { MapPin, Bed, Bath, Square, User, Phone, Mail, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ImageCarousel from '../components/ImageCarousel';
import { VideoThumbnail, VideoPlayer } from '../components/VideoPlayer';
import { getFileUrl } from '../utils/mediaUtils';
import authStore from '../stores/AuthStore';
import Avatar from '../components/Avatar';

const PublicPropertyDetails = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openLogin } = useOutletContext();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [deletingFile, setDeletingFile] = useState(null);

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

  const handleDeleteAttachment = async (attachment) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    setDeletingFile(attachment);
    try {
      await axiosInstance.delete(`/properties/${id}/file`, {
        data: { fileUrl: attachment, type: 'attachment' },
      });

      setProperty(prev => ({
        ...prev,
        attachments: (prev.attachments || []).filter(a => a !== attachment),
      }));
    } catch (err) {
      console.error('Error deleting attachment:', err);
      alert('Failed to delete attachment');
    } finally {
      setDeletingFile(null);
    }
  };

  const handleDeleteVideo = async (video) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeletingFile(video);
    try {
      await axiosInstance.delete(`/properties/${id}/file`, {
        data: { fileUrl: video, type: 'video' },
      });

      setProperty(prev => ({
        ...prev,
        videos: (prev.videos || []).filter(v => v !== video),
      }));
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video');
    } finally {
      setDeletingFile(null);
    }
  };

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
    videos,
    attachments,
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
            className="hover:opacity-80 transition-opacity"
          >
            <Avatar user={user} size="lg" />
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

            {(videos?.length > 0 || attachments?.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">📸 Videos & Attachments</h2>
                
                {videos && videos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">🎥 Videos ({videos.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video, index) => (
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
                          {authStore.isAuthenticated && (authStore.user?.role === 'admin' || authStore.user?.role === 'agent') && (
                            <button
                              onClick={() => handleDeleteVideo(video)}
                              disabled={deletingFile === video}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10"
                              title="Delete video"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {attachments && attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">📎 Files ({attachments.length})</h3>
                    <div className="space-y-2">
                      {attachments.map((attachment, index) => {
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
                                href={getFileUrl(attachment)}
                                download
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                Download
                              </a>
                              {authStore.isAuthenticated && (authStore.user?.role === 'admin' || authStore.user?.role === 'agent') && (
                                <button
                                  onClick={() => handleDeleteAttachment(attachment)}
                                  disabled={deletingFile === attachment}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                  title="Delete attachment"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
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

      <VideoPlayer
        videos={videos || []}
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        initialIndex={selectedVideoIndex}
      />
    </div>
  );
});

export default PublicPropertyDetails;
