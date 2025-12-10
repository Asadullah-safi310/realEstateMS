import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PropertyStore from '../stores/PropertyStore';
import ImageCarousel from '../components/ImageCarousel';
import useViewPreference from '../hooks/useViewPreference';
import useTranslation from '../hooks/useTranslation';
import { showSuccess, showError } from '../utils/toast';

const PropertyList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('properties');
  const { t } = useTranslation();

  useEffect(() => {
    PropertyStore.fetchProperties();
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
                ☰ {t('common.search')}
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
          <div className="bg-white shadow-md rounded overflow-hidden">
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
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/properties/${property.property_id}`)} className="text-blue-600 hover:underline mr-2">Edit</button>
                      <button onClick={() => handleDelete(property.property_id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PropertyStore.properties.map(property => (
              <div key={property.property_id} className="bg-white shadow-md rounded overflow-hidden hover:shadow-lg transition">
                <ImageCarousel images={property.photos || []} title="Property Photos" />

                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/properties/${property.property_id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.property_id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      Delete
                    </button>
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
