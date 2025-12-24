import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import PropertyStore from "../../stores/PropertyStore";
import { userPropertySchema } from "../../validation/schemas";
import { showSuccess, showError } from "../../utils/toast";
import { Loader2, Upload, X, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import LocationPicker from "../../components/LocationPicker";

const AddProperty = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  // Location Data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);

  const [initialValues, setInitialValues] = useState({
    property_type: "",
    purpose: "",
    sale_price: "",
    rent_price: "",
    province_id: "",
    district_id: "",
    area_id: "",
    location: "", // Legacy/Fallback
    address: "", // Google Maps Address
    city: "", // Legacy/Fallback
    area_size: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    latitude: "",
    longitude: "",
    is_available_for_sale: false,
    is_available_for_rent: false,
    is_photo_available: false,
    is_attachment_available: false,
    is_video_available: false,
    videos: [],
  });

  useEffect(() => {
    fetchProvinces();
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const fetchProvinces = async () => {
    try {
      const response = await axiosInstance.get('/locations/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Failed to fetch provinces', error);
    }
  };

  const fetchDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/locations/provinces/${provinceId}/districts`);
      setDistricts(response.data);
    } catch (error) {
      console.error('Failed to fetch districts', error);
    }
  };

  const fetchAreas = async (districtId) => {
    if (!districtId) {
      setAreas([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/locations/districts/${districtId}/areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to fetch areas', error);
    }
  };

  const loadProperty = async (propertyId) => {
    const property = await PropertyStore.fetchPropertyById(propertyId);
    if (property) {
      // Load dependent location data
      if (property.province_id) await fetchDistricts(property.province_id);
      if (property.district_id) await fetchAreas(property.district_id);

      setInitialValues({
        property_type: property.property_type || "",
        purpose: property.purpose || "",
        sale_price: property.sale_price ? parseFloat(property.sale_price) : "",
        rent_price: property.rent_price ? parseFloat(property.rent_price) : "",
        province_id: property.province_id || "",
        district_id: property.district_id || "",
        area_id: property.area_id || "",
        location: property.location || "",
        address: property.address || "",
        city: property.city || "",
        area_size: property.area_size || "",
        bedrooms: property.bedrooms || "",
        bathrooms: property.bathrooms || "",
        description: property.description || "",
        latitude: property.latitude ? parseFloat(property.latitude) : "",
        longitude: property.longitude ? parseFloat(property.longitude) : "",
        is_available_for_sale: property.is_available_for_sale || false,
        is_available_for_rent: property.is_available_for_rent || false,
        is_photo_available: property.is_photo_available || false,
        is_attachment_available: property.is_attachment_available || false,
        is_video_available: property.is_video_available || false,
        videos: property.videos || [],
      });
      setUploadedPhotos(property.photos || []);
      setUploadedAttachments(property.attachments || []);
      setUploadedVideos(property.videos || []);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      showError("Please select files to upload");
      return;
    }

    if (!id) {
      showError("Please create the property first before uploading files");
      return;
    }

    setUploadingFiles(true);
    const result = await PropertyStore.uploadFiles(id, selectedFiles);

    if (result) {
      showSuccess("Files uploaded successfully");
      setUploadedPhotos(result.photos || []);
      setUploadedAttachments(result.attachments || []);
      setUploadedVideos(result.videos || []);
      setSelectedFiles([]);
    } else {
      showError("Error: " + PropertyStore.error);
    }
    setUploadingFiles(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleDeleteUploadedFile = async (fileUrl, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await PropertyStore.deleteFile(id, fileUrl, type);
        if (type === 'photo') {
          setUploadedPhotos(uploadedPhotos.filter(p => p !== fileUrl));
        } else if (type === 'video') {
          setUploadedVideos(uploadedVideos.filter(v => v !== fileUrl));
        } else if (type === 'attachment') {
          setUploadedAttachments(uploadedAttachments.filter(a => a !== fileUrl));
        }
        showSuccess(`${type} deleted successfully`);
      } catch (err) {
        console.error('Error deleting file:', err);
        showError('Failed to delete file');
      }
    }
  };

  const handleSubmit = async (values) => {
    // Auto-fill legacy fields based on selection if empty
    if (values.province_id) {
      const province = provinces.find(p => p.id == values.province_id);
      if (province) values.city = province.name;
    }
    if (values.area_id) {
      const area = areas.find(a => a.id == values.area_id);
      if (area) values.location = area.name;
    }

    let success;
    if (id) {
      success = await PropertyStore.updateProperty(id, values);
    } else {
      success = await PropertyStore.createProperty(values);
    }

    if (success) {
      showSuccess(id ? "Property updated successfully" : "Property created successfully");
      navigate("/authenticated/properties");
    } else {
      showError("Error: " + PropertyStore.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        {id ? "Edit Property" : "Add New Property"}
      </h1>

        <div className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100">
          <Formik
            initialValues={initialValues}
            validationSchema={userPropertySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <Field
                      as="select"
                      name="property_type"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Type</option>
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </Field>
                    <ErrorMessage name="property_type" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <Field
                      as="select"
                      name="purpose"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Purpose</option>
                      <option value="RENT">Rent</option>
                      <option value="SALE">Sale</option>
                    </Field>
                    <ErrorMessage name="purpose" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                  {/* Location Section */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-medium text-blue-900 mb-4">Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <Field
                        as="select"
                        name="province_id"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue("province_id", val);
                          setFieldValue("district_id", "");
                          setFieldValue("area_id", "");
                          fetchDistricts(val);
                        }}
                      >
                        <option value="">Select Province</option>
                        {provinces.map(p => (
                          <option key={p.id} value={p.id}>{p.name} {p.native_name ? `(${p.native_name})` : ''}</option>
                        ))}
                      </Field>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <Field
                        as="select"
                        name="district_id"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        disabled={!values.province_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValue("district_id", val);
                          setFieldValue("area_id", "");
                          fetchAreas(val);
                        }}
                      >
                        <option value="">Select District</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name} {d.native_name ? `(${d.native_name})` : ''}</option>
                        ))}
                      </Field>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area / Place</label>
                      <Field
                        as="select"
                        name="area_id"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        disabled={!values.district_id}
                      >
                        <option value="">Select Area</option>
                        {areas.map(a => (
                          <option key={a.id} value={a.id}>{a.name} {a.native_name ? `(${a.native_name})` : ''}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Location & Map</label>
                    <LocationPicker 
                      setFieldValue={setFieldValue} 
                      values={values} 
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Additional Address Details (Optional)</label>
                      <Field
                        name="location"
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Building Name, Unit No, Street No, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area Size</label>
                    <Field
                      name="area_size"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g. 1200 sqft"
                    />
                    <ErrorMessage name="area_size" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <Field
                      name="bedrooms"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <Field
                      name="bathrooms"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Field
                    as="textarea"
                    name="description"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Describe your property..."
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">Availability & Pricing</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="is_available_for_sale"
                          name="is_available_for_sale"
                          checked={values.is_available_for_sale}
                          onChange={(e) => setFieldValue("is_available_for_sale", e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="is_available_for_sale" className="font-medium text-gray-700">Available for Sale</label>
                        {values.is_available_for_sale && (
                          <div className="mt-2">
                            <Field
                              name="sale_price"
                              type="number"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Sale Price ($)"
                            />
                            <ErrorMessage name="sale_price" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="is_available_for_rent"
                          name="is_available_for_rent"
                          checked={values.is_available_for_rent}
                          onChange={(e) => setFieldValue("is_available_for_rent", e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="is_available_for_rent" className="font-medium text-gray-700">Available for Rent</label>
                        {values.is_available_for_rent && (
                          <div className="mt-2">
                            <Field
                              name="rent_price"
                              type="number"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Rent Price ($/month)"
                            />
                            <ErrorMessage name="rent_price" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        )}
                      </div>
                    </div>
                    <ErrorMessage name="at-least-one-availability" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* File Upload Section - Only visible in Edit Mode */}
                {id && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Photos & Attachments</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <Upload size={20} />
                          Select Files
                          <input type="file" multiple onChange={handleFileSelect} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={handleUploadFiles}
                          disabled={uploadingFiles || selectedFiles.length === 0}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {uploadingFiles ? <Loader2 size={20} className="animate-spin" /> : 'Upload Selected'}
                        </button>
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm flex items-center gap-2">
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <button type="button" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Display Uploaded Photos */}
                    {uploadedPhotos.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {uploadedPhotos.map((photo, index) => (
                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img src={photo} alt={`Property ${index}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeleteUploadedFile(photo, 'photo')}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display Uploaded Attachments */}
                    {uploadedAttachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {uploadedAttachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600 truncate">{file.split('/').pop()}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteUploadedFile(file, 'attachment')}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/authenticated/properties")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                    {id ? "Update Property" : "Create Property"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
    </div>
  );
});

export default AddProperty;
