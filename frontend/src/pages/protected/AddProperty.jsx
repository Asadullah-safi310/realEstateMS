import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import PropertyStore from "../../stores/PropertyStore";
import PersonStore from "../../stores/PersonStore";
import { userPropertySchema } from "../../validation/schemas";
import { showSuccess, showError } from "../../utils/toast";
import { Loader2, Upload, X, Trash2, Globe, Lock } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import LocationPicker from "../../components/LocationPicker";
import PersonSelect from "../../components/PersonSelect";
import { getImageUrl, getFileUrl, validateFileSize, validateFileType, getFileTypeCategory, getFileExtension, getFileSizeDisplay } from "../../utils/mediaUtils";
import ConfirmDialog from "../../components/ConfirmDialog";

const AddProperty = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, fileUrl: null, type: null });
  
  // Location Data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);

  const [initialValues, setInitialValues] = useState({
    property_type: "",
    purpose: "",
    agent_id: null,
    status: "available",
    sale_price: null,
    rent_price: null,
    province_id: null,
    district_id: null,
    area_id: null,
    location: "", // Legacy/Fallback
    address: "", // Google Maps Address
    city: "", // Legacy/Fallback
    area_size: "",
    bedrooms: null,
    bathrooms: null,
    description: "",
    latitude: null,
    longitude: null,
    is_available_for_sale: false,
    is_available_for_rent: false,
    is_unavailable: true,
    is_photo_available: false,
    is_attachment_available: false,
    is_video_available: false,
    videos: [],
  });

  useEffect(() => {
    fetchProvinces();
    PersonStore.fetchAgents();
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
        agent_id: property.agent_id || null,
        status: property.status || "available",
        sale_price: property.sale_price ? parseFloat(property.sale_price) : null,
        rent_price: property.rent_price ? parseFloat(property.rent_price) : null,
        province_id: property.province_id || null,
        district_id: property.district_id || null,
        area_id: property.area_id || null,
        location: property.location || "",
        address: property.address || "",
        city: property.city || "",
        area_size: property.area_size || "",
        bedrooms: property.bedrooms || null,
        bathrooms: property.bathrooms || null,
        description: property.description || "",
        latitude: property.latitude ? parseFloat(property.latitude) : null,
        longitude: property.longitude ? parseFloat(property.longitude) : null,
        is_available_for_sale: property.is_available_for_sale || false,
        is_available_for_rent: property.is_available_for_rent || false,
        is_unavailable: !(property.is_available_for_sale || property.is_available_for_rent),
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
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (!validateFileType(file)) {
        errors.push(`${file.name}: Invalid file type`);
      } else if (!validateFileSize(file)) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      showError(`File validation errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles]);
      if (errors.length === 0) {
        showSuccess(`${validFiles.length} file(s) selected`);
      }
    }

    e.target.value = '';
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

  const handleDeleteUploadedFile = (fileUrl, type) => {
    setConfirmDialog({ isOpen: true, fileUrl, type });
  };

  const confirmDeleteUploadedFile = async () => {
    const { fileUrl, type } = confirmDialog;
    setConfirmDialog({ isOpen: false, fileUrl: null, type: null });

    setDeletingFile(fileUrl);
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
    } finally {
      setDeletingFile(null);
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

    const submissionData = {
      ...values,
      agent_id: values.agent_id === "" ? null : (values.agent_id ? parseInt(values.agent_id, 10) : null),
    };

    let success = false;
    let propertyId = id;
    
    if (id) {
      success = await PropertyStore.updateProperty(id, submissionData);
    } else {
      const createdProperty = await PropertyStore.createProperty(submissionData);
      if (createdProperty) {
        success = true;
        propertyId = createdProperty.id;
      }
    }

    if (success) {
      showSuccess(id ? "successfully Updated" : "Property created successfully");
      
      // Upload files if any are selected
      if (selectedFiles.length > 0 && propertyId) {
        setUploadingFiles(true);
        const uploadResult = await PropertyStore.uploadFiles(propertyId, selectedFiles);
        if (uploadResult) {
          showSuccess("Files uploaded successfully");
          setUploadedPhotos(uploadResult.photos || []);
          setUploadedAttachments(uploadResult.attachments || []);
          setUploadedVideos(uploadResult.videos || []);
          setSelectedFiles([]);
        } else {
          showError("Error uploading files: " + PropertyStore.error);
        }
        setUploadingFiles(false);
      }
      
      // Navigate after all uploads are done
      navigate("/authenticated/properties", { replace: true });
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
            {({ isSubmitting, values, setFieldValue, errors, touched }) => {
              // Debugging: Log errors when they occur
              if (Object.keys(errors).length > 0) {
                 console.log("Form Validation Errors:", errors);
              }
              
              return (
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Agent <span className="text-gray-500 font-normal">(Optional)</span></label>
                    <Field
                      as="select"
                      name="agent_id"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">No Agent</option>
                      {PersonStore.agents.map((agent) => (
                        <option key={agent.user_id} value={agent.user_id}>
                          {agent.full_name} ({agent.phone})
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="agent_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Status</label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="available">Available</option>
                      <option value="under_deal">Under Deal</option>
                      <option value="unavailable">Unavailable</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
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
                      <ErrorMessage name="province_id" component="div" className="text-red-500 text-sm mt-1" />
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
                      <ErrorMessage name="district_id" component="div" className="text-red-500 text-sm mt-1" />
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
                      <ErrorMessage name="area_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Location & Map</label>
                    <LocationPicker 
                      setFieldValue={setFieldValue} 
                      values={values} 
                      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
                    />
                    <ErrorMessage name="latitude" component="div" className="text-red-500 text-sm mt-1" />
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
                          id="is_unavailable"
                          name="is_unavailable"
                          checked={values.is_unavailable}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFieldValue("is_unavailable", checked);
                            if (checked) {
                              setFieldValue("is_available_for_sale", false);
                              setFieldValue("is_available_for_rent", false);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="is_unavailable" className="font-medium text-gray-700">Unavailable (Private)</label>
                        <p className="text-xs text-gray-500">Property will only be visible in your dashboard</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="is_available_for_sale"
                          name="is_available_for_sale"
                          checked={values.is_available_for_sale}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFieldValue("is_available_for_sale", checked);
                            if (checked) {
                              setFieldValue("is_unavailable", false);
                            } else if (!values.is_available_for_rent) {
                              setFieldValue("is_unavailable", true);
                            }
                          }}
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
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFieldValue("is_available_for_rent", checked);
                            if (checked) {
                              setFieldValue("is_unavailable", false);
                            } else if (!values.is_available_for_sale) {
                              setFieldValue("is_unavailable", true);
                            }
                          }}
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
                  </div>
                  <ErrorMessage name="at-least-one-availability" component="div" className="text-red-500 text-sm mt-2" />
                </div>

                {/* File Upload Section - Enhanced with better UI */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">📁 Media Upload (Optional)</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded p-4 mb-3 bg-white">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.mov,.avi,.mkv,.flv,.wmv,.mts,.m4v"
                      className="w-full"
                    />
                    <p className="text-gray-600 text-xs mt-3 font-medium">
                      📸 Supported: Images (JPG, PNG, GIF, WebP) • 🎥 Videos (MP4, WebM, AVI, QuickTime) • 📄 Documents (PDF, Word, Excel)
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Max file size: 10MB per file. Check media availability options above to categorize uploads.
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Selected Files ({selectedFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => {
                          const fileType = getFileTypeCategory(file);
                          const isImage = fileType === 'image';
                          const preview = isImage ? URL.createObjectURL(file) : null;

                          return (
                            <div
                              key={index}
                              className="flex gap-3 bg-white p-3 rounded border border-gray-200 hover:border-blue-300 transition"
                            >
                              {isImage && preview ? (
                                <img
                                  src={preview}
                                  alt={file.name}
                                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-gray-600">
                                    {getFileExtension(file.name)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getFileSizeDisplay(file.size)} • {fileType}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800 px-2 flex-shrink-0"
                                title="Remove file"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadFiles}
                        disabled={uploadingFiles}
                        className="mt-3 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {uploadingFiles ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Files
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {uploadedPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        📸 Uploaded Photos ({uploadedPhotos.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {uploadedPhotos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative bg-gray-100 rounded h-32 overflow-hidden group cursor-pointer"
                          >
                            <img
                              src={getImageUrl(photo)}
                              alt={`Property photo ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteUploadedFile(photo, 'photo')}
                              disabled={deletingFile === photo}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                              title="Delete photo"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedAttachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        📎 Uploaded Attachments ({uploadedAttachments.length})
                      </h4>
                      {uploadedAttachments.length > 0 ? (
                        <div className="space-y-2">
                          {uploadedAttachments.map((attachment, index) => {
                            const fileName = attachment.split('/').pop();
                            const fileType = fileName.split('.').pop().toUpperCase();
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-gray-50 transition group border border-gray-200"
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
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUploadedFile(attachment, 'attachment')}
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
                      ) : (
                        <p className="text-gray-500 text-sm italic">No attachments uploaded yet</p>
                      )}
                    </div>
                  )}

                  {uploadedVideos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        🎥 Uploaded Videos ({uploadedVideos.length})
                      </h4>
                      {uploadedVideos.length > 0 ? (
                        <div className="space-y-2">
                          {uploadedVideos.map((video, index) => {
                            const fileName = video.split('/').pop();
                            const isYouTube = video.includes('youtube.com') || video.includes('youtu.be');
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-gray-50 transition group border border-gray-200"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${isYouTube ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {isYouTube ? 'YOUTUBE' : 'VIDEO'}
                                  </span>
                                  <span className="text-sm text-gray-700">{fileName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUploadedFile(video, 'video')}
                                  disabled={deletingFile === video}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                  title="Delete video"
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No videos uploaded yet</p>
                      )}
                    </div>
                  )}
                </div>

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
                    disabled={isSubmitting || uploadingFiles}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {(isSubmitting || uploadingFiles) && <Loader2 size={20} className="animate-spin" />}
                    {id ? "Update Property" : "Create Property"}
                  </button>
                </div>
              </Form>
            );
          }}
          </Formik>
        </div>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete File"
          message={`Are you sure you want to delete this ${confirmDialog.type}? This action cannot be undone.`}
          onConfirm={confirmDeleteUploadedFile}
          onCancel={() => setConfirmDialog({ isOpen: false, fileUrl: null, type: null })}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />
    </div>
  );
});

export default AddProperty;
