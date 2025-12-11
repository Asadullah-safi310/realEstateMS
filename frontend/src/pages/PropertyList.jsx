import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PropertyStore from '../stores/PropertyStore';
import ImageCarousel from '../components/ImageCarousel';
import useViewPreference from '../hooks/useViewPreference';
import useTranslation from '../hooks/useTranslation';
import { showSuccess, showError } from '../utils/toast';
import { MoreVertical } from 'lucide-react';

const PropertyList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('properties');
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    PropertyStore.fetchProperties();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-action-menu]')) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('properties.deleteConfirm'))) {
      const success = await PropertyStore.deleteProperty(id);
      if (success) {
        showSuccess(t('properties.propertyDeleted'));
      } else {
        showError('Error: ' + PropertyStore.error);
      }
    }
  };

  const ActionMenu = ({ propertyId, isGridView }) => (
    <div className="relative z-20" data-action-menu>
      <button
        onClick={() => setOpenMenu(openMenu === propertyId ? null : propertyId)}
        className="p-1 text-gray-600 hover:text-gray-900"
      >
        <MoreVertical size={18} />
      </button>
      {openMenu === propertyId && (
        <div className={`absolute ${isGridView ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-50`}>
          <button
            onClick={() => {
              navigate(`/property-details/${propertyId}`);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            📋 Details & History
          </button>
          <button
            onClick={() => {
              navigate('/create-deal', { state: { propertyId } });
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            🔄 Transfer Ownership
          </button>
          <button
            onClick={() => {
              navigate(`/properties/${propertyId}`);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              handleDelete(propertyId);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('properties.title')}</h1>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 bg-gray-200 rounded p-1">
              <button
                onClick={() => toggleView('list')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                ☰ List
              </button>
              <button
                onClick={() => toggleView('card')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⊞ Grid
              </button>
            </div>
            <button onClick={() => navigate('/properties/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              {t('properties.addProperty')}
            </button>
          </div>
        </div>

        {PropertyStore.loading ? (
          <p>{t('common.loading')}</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-visible">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Purpose</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-left font-semibold">City</th>
                  <th className="px-4 py-3 text-left font-semibold">Photos</th>
                  <th className="px-4 py-3 text-left font-semibold">Map</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PropertyStore.properties.map(property => (
                  <tr key={property.property_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{property.property_type}</td>
                    <td className="px-4 py-3">{property.purpose}</td>
                    <td className="px-4 py-3">Rs {property.price}</td>
                    <td className="px-4 py-3">{property.location}</td>
                    <td className="px-4 py-3">{property.city}</td>
                    <td className="px-4 py-3">
                      {property.photos && property.photos.length > 0 ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {property.photos.length} photos
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No photos</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {property.latitude && property.longitude ? (
                        <a
                          href={`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                          title={`${property.latitude}, ${property.longitude}`}
                        >
                          📍 View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No coords</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                        property.status === 'available' ? 'bg-green-500' :
                        property.status === 'sold' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <ActionMenu propertyId={property.property_id} isGridView={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PropertyStore.properties.map(property => (
              <div key={property.property_id} className="bg-white shadow-md rounded overflow-hidden hover:shadow-lg transition flex flex-col">
                <ImageCarousel images={property.photos || []} title="Property Photos" />

                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800">
                        {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-white text-xs font-semibold whitespace-nowrap ${
                      property.status === 'available' ? 'bg-green-500' :
                      property.status === 'sold' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      {property.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Purpose</p>
                      <p className="font-semibold text-gray-800">{property.purpose}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-semibold text-gray-800">Rs {property.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Area</p>
                      <p className="font-semibold text-gray-800">{property.area_size}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bedrooms</p>
                      <p className="font-semibold text-gray-800">{property.bedrooms || 'N/A'}</p>
                    </div>
                  </div>

                  {property.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.latitude && property.longitude && (
                      <a
                        href={`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded transition"
                      >
                        📍 View Map
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/property-details/${property.property_id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => navigate('/create-deal', { state: { propertyId: property.property_id } })}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      Transfer
                    </button>
                    <div className="relative">
                      <ActionMenu propertyId={property.property_id} isGridView={true} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
});

export default PropertyList;
