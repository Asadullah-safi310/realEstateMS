import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import MainLayout from '../layouts/MainLayout';
import PropertyStore from '../stores/PropertyStore';
import OwnerStore from '../stores/OwnerStore';
import { propertySchema } from '../validation/schemas';
import useTranslation from '../hooks/useTranslation';
import { showSuccess, showError } from '../utils/toast';

const AddProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [initialValues, setInitialValues] = useState({
    owner_id: '',
    property_type: '',
    purpose: '',
    price: '',
    location: '',
    city: '',
    area_size: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    OwnerStore.fetchOwners();
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId) => {
    const property = await PropertyStore.fetchPropertyById(propertyId);
    if (property) {
      setInitialValues({
        owner_id: property.owner_id || '',
        property_type: property.property_type || '',
        purpose: property.purpose || '',
        price: property.price ? parseFloat(property.price) : '',
        location: property.location || '',
        city: property.city || '',
        area_size: property.area_size || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        description: property.description || '',
        latitude: property.latitude ? parseFloat(property.latitude) : '',
        longitude: property.longitude ? parseFloat(property.longitude) : '',
      });
      setUploadedPhotos(property.photos || []);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      showError(t('properties.selectFiles'));
      return;
    }

    if (!id) {
      showError(t('properties.createFirst'));
      return;
    }

    setUploadingFiles(true);
    const result = await PropertyStore.uploadFiles(id, selectedFiles);

    if (result) {
      showSuccess(t('properties.uploadSuccess'));
      setUploadedPhotos(result.photos || []);
      setSelectedFiles([]);
    } else {
      showError('Error: ' + PropertyStore.error);
    }
    setUploadingFiles(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    let success;
    if (id) {
      success = await PropertyStore.updateProperty(id, values);
    } else {
      success = await PropertyStore.createProperty(values);
    }

    if (success) {
      showSuccess(id ? t('properties.propertyUpdated') : t('properties.propertyCreated'));
      navigate('/properties');
    } else {
      showError('Error: ' + PropertyStore.error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{id ? t('properties.editProperty') : t('properties.addProperty')}</h1>

        <div className="bg-white shadow-md rounded p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={propertySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="owner_id" className="block text-gray-700 text-sm font-semibold mb-2">{t('properties.owner')}</label>
                  <Field as="select" name="owner_id" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Owner</option>
                    {OwnerStore.owners.map(owner => (
                      <option key={owner.owner_id} value={owner.owner_id}>{owner.owner_name}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="owner_id" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="property_type" className="block text-gray-700 text-sm font-semibold mb-2">Property Type</label>
                  <Field as="select" name="property_type" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Type</option>
                    <option value="plot">Plot</option>
                    <option value="house">House</option>
                    <option value="flat">Flat</option>
                    <option value="shop">Shop</option>
                  </Field>
                  <ErrorMessage name="property_type" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="purpose" className="block text-gray-700 text-sm font-semibold mb-2">Purpose</label>
                  <Field as="select" name="purpose" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Purpose</option>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </Field>
                  <ErrorMessage name="purpose" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="price" className="block text-gray-700 text-sm font-semibold mb-2">Price</label>
                  <Field name="price" type="number" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="price" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="location" className="block text-gray-700 text-sm font-semibold mb-2">Location</label>
                  <Field name="location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="location" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">City</label>
                  <Field name="city" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="city" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="area_size" className="block text-gray-700 text-sm font-semibold mb-2">Area Size</label>
                  <Field name="area_size" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="area_size" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="bedrooms" className="block text-gray-700 text-sm font-semibold mb-2">Bedrooms</label>
                    <Field name="bedrooms" type="number" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label htmlFor="bathrooms" className="block text-gray-700 text-sm font-semibold mb-2">Bathrooms</label>
                    <Field name="bathrooms" type="number" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                  <Field as="textarea" name="description" className="w-full px-3 py-2 border border-gray-300 rounded" rows="4" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="latitude" className="block text-gray-700 text-sm font-semibold mb-2">Latitude (Optional)</label>
                    <Field name="latitude" type="number" step="0.00000001" placeholder="e.g., 24.8607" className="w-full px-3 py-2 border border-gray-300 rounded" />
                    <ErrorMessage name="latitude" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-gray-700 text-sm font-semibold mb-2">Longitude (Optional)</label>
                    <Field name="longitude" type="number" step="0.00000001" placeholder="e.g., 67.0011" className="w-full px-3 py-2 border border-gray-300 rounded" />
                    <ErrorMessage name="longitude" component="div" className="text-red-600 text-sm mt-1" />
                  </div>
                </div>

                {id && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Photos & Attachments</label>
                    <div className="border-2 border-dashed border-gray-300 rounded p-4 mb-3">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx"
                        className="w-full"
                      />
                      <p className="text-gray-500 text-xs mt-2">Select images or documents (max 10 files)</p>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Files ({selectedFiles.length})</h4>
                        <ul className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={handleUploadFiles}
                          disabled={uploadingFiles}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
                        >
                          {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                        </button>
                      </div>
                    )}

                    {uploadedPhotos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Photos ({uploadedPhotos.length})</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedPhotos.map((photo, index) => (
                            <div key={index} className="relative bg-gray-100 rounded h-32 overflow-hidden">
                              <img
                                src={`http://localhost:5000${photo}`}
                                alt={`Property photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    {id ? t('common.update') : t('common.create')}
                  </button>
                  <button type="button" onClick={() => navigate('/properties')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
                    {t('common.cancel')}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddProperty;
