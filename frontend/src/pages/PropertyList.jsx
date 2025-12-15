import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PropertyStore from '../stores/PropertyStore';
import ImageCarousel from '../components/ImageCarousel';
import useViewPreference from '../hooks/useViewPreference';
import useTranslation from '../hooks/useTranslation';
import { showSuccess, showError } from '../utils/toast';
import { MoreVertical, SlidersHorizontal, Phone, MapPin } from 'lucide-react';
import PropertyFilterPanel from '../components/PropertyFilterPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import CallOwnerModal from '../components/CallOwnerModal';

const PropertyList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('properties');
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    availability: { sale: false, rent: false },
    propertyTypes: [],
    dealType: 'both',
    priceMin: '',
    priceMax: '',
    rentMin: '',
    rentMax: '',
    city: '',
    location: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, propertyId: null });
  const [callModal, setCallModal] = useState({ isOpen: false, ownerName: '', ownerPhone: '' });

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

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, propertyId: id });
  };

  const confirmDelete = async () => {
    const { propertyId } = confirmDialog;
    setConfirmDialog({ isOpen: false, propertyId: null });
    
    const success = await PropertyStore.deleteProperty(propertyId);
    if (success) {
      showSuccess(t('properties.propertyDeleted'));
    } else {
      showError('Error: ' + PropertyStore.error);
    }
  };

  const getAvailabilityBadges = (property) => {
    const badges = [];
    if (Boolean(property?.is_available_for_sale)) badges.push({ icon: '🟢', text: 'For Sale', color: 'bg-green-100 text-green-800' });
    if (Boolean(property?.is_available_for_rent)) badges.push({ icon: '🔵', text: 'For Rent', color: 'bg-blue-100 text-blue-800' });
    if (badges.length === 2) {
      return [{ icon: '🟣', text: 'Sale & Rent', color: 'bg-purple-100 text-purple-800' }];
    }
    return badges;
  };

  const getFilteredProperties = () => {
    let filtered = PropertyStore.properties || [];

    const { availability, propertyTypes, priceMin, priceMax, rentMin, rentMax, city, location } = appliedFilters;

    if (availability.sale || availability.rent) {
      filtered = filtered.filter(p => {
        const hasAvailability = (availability.sale && Boolean(p.is_available_for_sale)) || 
                               (availability.rent && Boolean(p.is_available_for_rent));
        return hasAvailability;
      });
    }

    if (propertyTypes.length > 0) {
      filtered = filtered.filter(p => propertyTypes.includes(p.property_type));
    }

    if (priceMin) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.sale_price) || parseFloat(p.rent_price) || 0;
        return price >= parseFloat(priceMin);
      });
    }

    if (priceMax) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.sale_price) || parseFloat(p.rent_price) || 0;
        return price <= parseFloat(priceMax);
      });
    }

    if (rentMin) {
      filtered = filtered.filter(p => {
        if (!Boolean(p.is_available_for_rent)) return false;
        const rentPrice = parseFloat(p.rent_price) || 0;
        return rentPrice >= parseFloat(rentMin);
      });
    }

    if (rentMax) {
      filtered = filtered.filter(p => {
        if (!Boolean(p.is_available_for_rent)) return false;
        const rentPrice = parseFloat(p.rent_price) || 0;
        return rentPrice <= parseFloat(rentMax);
      });
    }

    if (city) {
      filtered = filtered.filter(p => 
        p.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredProperties = getFilteredProperties();

  const canCreateDeal = (property) => {
    return Boolean(property.is_available_for_sale) || Boolean(property.is_available_for_rent);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setIsFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setAppliedFilters({
      availability: { sale: false, rent: false },
      propertyTypes: [],
      dealType: 'both',
      priceMin: '',
      priceMax: '',
      rentMin: '',
      rentMax: '',
      city: '',
      location: ''
    });
    setIsFilterPanelOpen(false);
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
        <div className={`absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-50`}>
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
            disabled={!canCreateDeal(PropertyStore.properties.find(p => p.property_id === propertyId))}
            className="w-full text-left px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 text-gray-700 hover:bg-gray-100"
          >
            🔄 Create Deal
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{t('properties.title')}</h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsFilterPanelOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <SlidersHorizontal size={18} />
                🔍 Filters
              </button>
              <button onClick={() => navigate('/properties/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                {t('properties.addProperty')}
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <label className="text-sm font-semibold text-gray-700">View:</label>
            <div className="flex gap-2 bg-gray-100 rounded p-1">
              <button
                onClick={() => toggleView('list')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'list'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-300'
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
              >
                ☰ List
              </button>
              <button
                onClick={() => toggleView('card')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'card'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-300'
                    : 'bg-transparent text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⊞ Grid
              </button>
            </div>
          </div>
        </div>

        {PropertyStore.loading ? (
          <p>{t('common.loading')}</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-visible">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Purpose</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Sale Price</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Rent Price</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">City</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Availability for Sale/Rent</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Map</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property, idx) => (
                  <tr key={property.property_id} className={`border-t hover:bg-blue-50 transition cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} onClick={() => navigate(`/property-details/${property.property_id}`)}>
                    <td className="px-4 py-4 text-gray-800">{property.property_type}</td>
                    <td className="px-4 py-4 text-gray-600">{property.purpose}</td>
                    <td className="px-4 py-4 text-gray-800 font-medium">{property.sale_price ? `Rs ${parseFloat(property.sale_price).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-4 text-gray-800 font-medium">{property.rent_price ? `Rs ${parseFloat(property.rent_price).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-4 text-gray-600">{property.location}</td>
                    <td className="px-4 py-4 text-gray-600">{property.city}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {getAvailabilityBadges(property).length > 0 ? (
                          getAvailabilityBadges(property).map((badge, idx) => (
                            <span key={idx} className={`inline-block text-xs px-2 py-1 rounded font-semibold ${badge.color}`}>
                              {badge.icon} {badge.text}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Not available</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {property.latitude && property.longitude ? (
                        <a
                          href={`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          title={`${property.latitude}, ${property.longitude}`}
                        >
                          📍 View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 relative" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu propertyId={property.property_id} isGridView={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProperties.map(property => (
              <div 
                key={property.property_id} 
                className="bg-white shadow-md rounded-lg relative hover:shadow-xl hover:scale-105 transition-all flex flex-col border border-gray-100 cursor-pointer group"
                onClick={() => navigate(`/property-details/${property.property_id}`)}
              >
                <div className="relative h-44 overflow-hidden bg-gray-200 rounded-t-lg">
                  <ImageCarousel images={property.photos || []} title="Property Photos" />
                </div>

                <div className="absolute top-2 right-2 z-50" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu propertyId={property.property_id} isGridView={true} />
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-800">
                      🏠 {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                    </h3>
                    {property.latitude && property.longitude && (
                      <a
                        href={`https://www.google.com/maps/?q=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        title={`${property.latitude}, ${property.longitude}`}
                      >
                        <MapPin size={18} />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                    📍 {property.location}, {property.city}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs bg-gray-50 p-2 rounded">
                    <div className="text-center">
                      <p className="text-gray-500">Beds</p>
                      <p className="font-bold text-gray-800">{property.bedrooms || '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Baths</p>
                      <p className="font-bold text-gray-800">{property.bathrooms || '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Area</p>
                      <p className="font-bold text-gray-800">{property.area_size ? `${property.area_size} sq ft` : '-'}</p>
                    </div>
                  </div>

                  {(property.is_available_for_sale || property.is_available_for_rent) && (
                    <div className="mb-3 space-y-1">
                      {property.is_available_for_sale && (
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-500 font-semibold">Sale Price</p>
                          <p className="font-bold text-blue-600">Rs {parseFloat(property.sale_price).toLocaleString()}</p>
                        </div>
                      )}
                      {property.is_available_for_rent && (
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-500 font-semibold">Rent Price</p>
                          <p className="font-bold text-green-600">Rs {parseFloat(property.rent_price).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap mb-3">
                    {getAvailabilityBadges(property).map((badge, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded font-semibold ${badge.color}`}>
                        {badge.icon} {badge.text}
                      </span>
                    ))}
                  </div>

                  {property.current_owner && (
                    <div className="mt-auto pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCallModal({ isOpen: true, ownerName: property.current_owner.Person?.full_name, ownerPhone: property.current_owner.Person?.phone });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Call Owner
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <PropertyFilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filters={appliedFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDialog({ isOpen: false, propertyId: null })}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />

        <CallOwnerModal
          isOpen={callModal.isOpen}
          onClose={() => setCallModal({ isOpen: false, ownerName: '', ownerPhone: '' })}
          ownerName={callModal.ownerName}
          ownerPhone={callModal.ownerPhone}
        />
      </div>
    </MainLayout>
  );
});

export default PropertyList;
