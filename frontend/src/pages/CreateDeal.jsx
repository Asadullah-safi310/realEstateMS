import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import axiosInstance from '../api/axiosInstance';
import { showSuccess, showError } from '../utils/toast';

const CreateDeal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propertyIdFromState = location.state?.propertyId;

  const [properties, setProperties] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    deal_type: 'SALE',
    property_id: '',
    owner_id: '',
    buyer_id: '',
    price: '',
    start_date: '',
    notes: '',
  });

  const [selectedPropertyData, setSelectedPropertyData] = useState(null);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [propertiesRes, personsRes] = await Promise.all([
          axiosInstance.get('/properties'),
          axiosInstance.get('/persons'),
        ]);

        setProperties(propertiesRes.data);
        setPersons(personsRes.data);

        if (propertyIdFromState) {
          const prop = propertiesRes.data.find(p => p.property_id === propertyIdFromState);
          if (prop) {
            const canSale = Boolean(prop.is_available_for_sale);
            const canRent = Boolean(prop.is_available_for_rent);

            if (canSale && canRent) {
              setShowTypeModal(true);
            } else if (canSale) {
              await initializeWithProperty(propertyIdFromState, 'SALE', prop);
            } else if (canRent) {
              await initializeWithProperty(propertyIdFromState, 'RENT', prop);
            }
          }
        }
      } catch (err) {
        showError('Failed to load data');
        console.error(err);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchInitialData();
  }, [propertyIdFromState]);

  const initializeWithProperty = async (propertyId, dealType, propertyData) => {
    try {
      setFormData(prev => ({
        ...prev,
        deal_type: dealType,
        property_id: String(propertyId),
      }));
      setSelectedPropertyData(propertyData);
      await fetchOwnerData(propertyId);
      setShowTypeModal(false);
    } catch (err) {
      console.error('Error initializing:', err);
      showError('Failed to initialize form');
    }
  };

  const fetchOwnerData = async (propertyId) => {
    try {
      const res = await axiosInstance.get(`/person-property-roles/property/${propertyId}/current-owner`);
      const owner = res.data.Person;
      if (owner) {
        setCurrentOwner(owner);
        setFormData(prev => ({
          ...prev,
          owner_id: String(owner.person_id),
        }));
      }
    } catch (err) {
      console.error('Error fetching owner:', err);
      setCurrentOwner(null);
    }
  };

  const handlePropertyChange = async (e) => {
    const propertyId = e.target.value;
    setFormData(prev => ({
      ...prev,
      property_id: propertyId,
      buyer_id: '',
    }));
    setErrors(prev => ({ ...prev, property_id: '' }));

    if (!propertyId) {
      setSelectedPropertyData(null);
      setCurrentOwner(null);
      return;
    }

    const prop = properties.find(p => p.property_id === parseInt(propertyId));
    if (!prop) return;

    const dealType = formData.deal_type;
    const isAvailable = dealType === 'SALE' ? Boolean(prop.is_available_for_sale) : Boolean(prop.is_available_for_rent);

    if (!isAvailable) {
      showError(`This property is not available for ${dealType.toLowerCase()}`);
      setFormData(prev => ({ ...prev, property_id: '' }));
      setSelectedPropertyData(null);
      setCurrentOwner(null);
      return;
    }

    setSelectedPropertyData(prop);
    await fetchOwnerData(propertyId);
  };

  const handleDealTypeChange = (dealType) => {
    setFormData(prev => ({
      ...prev,
      deal_type: dealType,
      property_id: '',
      buyer_id: '',
      start_date: '',
    }));
    setSelectedPropertyData(null);
    setCurrentOwner(null);
    setErrors({});
  };

  const getFilteredProperties = () => {
    if (formData.deal_type === 'SALE') {
      return properties.filter(p => Boolean(p.is_available_for_sale));
    }
    return properties.filter(p => Boolean(p.is_available_for_rent));
  };

  const getAvailableBuyersTenants = () => {
    if (!currentOwner) return persons;
    return persons.filter(p => p.person_id !== currentOwner.person_id);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.deal_type) newErrors.deal_type = 'Deal type is required';
    if (!formData.property_id) newErrors.property_id = 'Property is required';
    if (!formData.owner_id) newErrors.owner_id = 'Current owner is required';
    if (!formData.buyer_id) {
      newErrors.buyer_id = formData.deal_type === 'SALE' ? 'Buyer is required' : 'Tenant is required';
    }
    if (formData.deal_type === 'RENT' && !formData.start_date) {
      newErrors.start_date = 'Start date is required for rent deals';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        deal_type: formData.deal_type,
        property_id: parseInt(formData.property_id),
        owner_id: parseInt(formData.owner_id),
        buyer_id: parseInt(formData.buyer_id),
        tenant_id: formData.deal_type === 'RENT' ? parseInt(formData.buyer_id) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        start_date: formData.deal_type === 'RENT' ? formData.start_date : null,
        notes: formData.notes,
      };

      console.log('Submitting payload:', payload);

      const response = await axiosInstance.post('/deals', payload);
      console.log('Deal created - Full response:', response.data);
      console.log('Updated property data:', {
        property_id: response.data.property?.property_id,
        is_available_for_sale: response.data.property?.is_available_for_sale,
        is_available_for_rent: response.data.property?.is_available_for_rent,
        status: response.data.property?.status
      });

      showSuccess(`${formData.deal_type} deal created successfully!`);
      setTimeout(() => {
        navigate('/deals');
      }, 1000);
    } catch (err) {
      console.error('Error creating deal:', err);
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Failed to create deal';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Deal Type</h2>
            <p className="text-gray-600 mb-6">This property is available for both Sale and Rent.</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  const prop = properties.find(p => p.property_id === propertyIdFromState);
                  if (prop) {
                    await initializeWithProperty(propertyIdFromState, 'SALE', prop);
                  }
                }}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                🏷️ Create Sale Deal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const prop = properties.find(p => p.property_id === propertyIdFromState);
                  if (prop) {
                    await initializeWithProperty(propertyIdFromState, 'RENT', prop);
                  }
                }}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                📅 Create Rent Deal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create Deal</h1>
        <p className="text-gray-600 mb-8">Create a new property deal (Sale or Rent)</p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!propertyIdFromState && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Deal Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleDealTypeChange('SALE')}
                    className={`py-3 px-4 rounded-lg font-medium transition ${
                      formData.deal_type === 'SALE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏷️ Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDealTypeChange('RENT')}
                    className={`py-3 px-4 rounded-lg font-medium transition ${
                      formData.deal_type === 'RENT'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 Rent
                  </button>
                </div>
              </div>
            )}

            {propertyIdFromState && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  📋 Deal Type: <span className="font-bold text-blue-600">{formData.deal_type}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.property_id}
                onChange={handlePropertyChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.property_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a property</option>
                {getFilteredProperties().map(prop => (
                  <option key={prop.property_id} value={prop.property_id}>
                    {prop.property_type} - {prop.location}, {prop.city} (Rs. {parseFloat(prop.price).toLocaleString()})
                  </option>
                ))}
              </select>
              {errors.property_id && <p className="text-red-500 text-sm mt-1">{errors.property_id}</p>}
            </div>

            {selectedPropertyData && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Current Owner</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="font-medium text-gray-900">
                    {currentOwner ? currentOwner.full_name : 'Loading...'}
                  </p>
                  {currentOwner && <p className="text-sm text-gray-600">{currentOwner.phone}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {formData.deal_type === 'SALE' ? 'Buyer' : 'Tenant'} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.buyer_id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, buyer_id: e.target.value }));
                  setErrors(prev => ({ ...prev, buyer_id: '' }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.buyer_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {formData.deal_type === 'SALE' ? 'Select Buyer' : 'Select Tenant'}
                </option>
                {getAvailableBuyersTenants().map(person => (
                  <option key={person.person_id} value={person.person_id}>
                    {person.full_name} - {person.phone}
                  </option>
                ))}
              </select>
              {errors.buyer_id && <p className="text-red-500 text-sm mt-1">{errors.buyer_id}</p>}
            </div>

            {formData.deal_type === 'RENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, start_date: e.target.value }));
                    setErrors(prev => ({ ...prev, start_date: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {formData.deal_type === 'SALE' ? 'Sale Price' : 'Monthly Rent'} (Optional)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, price: e.target.value }));
                  setErrors(prev => ({ ...prev, price: '' }));
                }}
                placeholder="Enter price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, notes: e.target.value }));
                }}
                placeholder="Add any additional notes about this deal (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Creating...' : `Create ${formData.deal_type} Deal`}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateDeal;
