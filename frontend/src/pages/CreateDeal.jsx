import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import MainLayout from '../layouts/MainLayout';
import { dealSchema } from '../validation/schemas';
import axiosInstance from '../api/axiosInstance';
import { showSuccess, showError } from '../utils/toast';

const CreateDeal = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesRes, personsRes] = await Promise.all([
          axiosInstance.get('/properties'),
          axiosInstance.get('/persons'),
        ]);
        setProperties(propertiesRes.data);
        setPersons(personsRes.data);
      } catch (err) {
        showError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handlePropertyChange = async (propertyId) => {
    const property = properties.find(p => p.property_id === parseInt(propertyId));
    setSelectedProperty(property);

    if (property) {
      try {
        const [ownerRes, tenantRes] = await Promise.all([
          axiosInstance.get(`/person-property-roles/property/${propertyId}/current-owner`),
          axiosInstance.get(`/person-property-roles/property/${propertyId}/current-tenant`),
        ]);
        setCurrentOwner(ownerRes.data.Person || null);
        setCurrentTenant(tenantRes.data.Person || null);
        formik.setFieldValue('owner_id', ownerRes.data.Person?.person_id || '');
        formik.setFieldValue('tenant_id', tenantRes.data.Person?.person_id || null);
      } catch (err) {
        setCurrentOwner(null);
        setCurrentTenant(null);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      deal_type: 'SALE',
      property_id: '',
      owner_id: '',
      buyer_id: '',
      tenant_id: null,
      price: '',
      start_date: '',
      notes: '',
    },
    validationSchema: dealSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          property_id: parseInt(values.property_id),
          owner_id: parseInt(values.owner_id),
          buyer_id: parseInt(values.buyer_id),
          tenant_id: values.tenant_id ? parseInt(values.tenant_id) : null,
          price: values.price ? parseFloat(values.price) : null,
        };

        await axiosInstance.post('/deals', payload);
        showSuccess(`${values.deal_type} deal created successfully!`);
        navigate('/deals');
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to create deal');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Transfer Ownership / Create Deal</h1>
        <p className="text-gray-600 mb-8">Create a new property deal (Sale or Rent)</p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Deal Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Deal Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('deal_type', 'SALE');
                    formik.setFieldValue('start_date', '');
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition ${
                    formik.values.deal_type === 'SALE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏷️ Sale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('deal_type', 'RENT');
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition ${
                    formik.values.deal_type === 'RENT'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Rent
                </button>
              </div>
            </div>

            {/* Property Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                name="property_id"
                value={formik.values.property_id}
                onChange={(e) => {
                  formik.handleChange(e);
                  handlePropertyChange(e.target.value);
                }}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.property_id && formik.errors.property_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a property</option>
                {properties.map(prop => (
                  <option key={prop.property_id} value={prop.property_id}>
                    {prop.property_type} - {prop.location}, {prop.city} (Rs. {parseFloat(prop.price).toLocaleString()})
                  </option>
                ))}
              </select>
              {formik.touched.property_id && formik.errors.property_id && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.property_id}</p>
              )}
            </div>

            {/* Current Owner (Read-only) */}
            {selectedProperty && (
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

            {/* Buyer/Tenant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {formik.values.deal_type === 'SALE' ? 'Buyer' : 'Tenant'} <span className="text-red-500">*</span>
              </label>
              <select
                name="buyer_id"
                value={formik.values.buyer_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.buyer_id && formik.errors.buyer_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">
                  {formik.values.deal_type === 'SALE' ? 'Select Buyer' : 'Select Tenant'}
                </option>
                {persons.map(person => (
                  <option key={person.person_id} value={person.person_id}>
                    {person.full_name} - {person.phone}
                  </option>
                ))}
              </select>
              {formik.touched.buyer_id && formik.errors.buyer_id && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.buyer_id}</p>
              )}
            </div>

            {/* Current Tenant (for SALE) */}
            {formik.values.deal_type === 'SALE' && selectedProperty && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Current Tenant</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="font-medium text-gray-900">
                    {currentTenant ? currentTenant.full_name : 'No Tenant'}
                  </p>
                  {currentTenant && <p className="text-sm text-gray-600">{currentTenant.phone}</p>}
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {formik.values.deal_type === 'SALE' ? 'Sale Price' : 'Monthly Rent'} (Optional)
              </label>
              <input
                type="number"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter price"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.price && formik.errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formik.touched.price && formik.errors.price && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
              )}
            </div>

            {/* Start Date (for RENT) */}
            {formik.values.deal_type === 'RENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formik.values.start_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.start_date && formik.errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.start_date && formik.errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.start_date}</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Add any additional notes about this deal"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Creating...' : `Create ${formik.values.deal_type} Deal`}
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
