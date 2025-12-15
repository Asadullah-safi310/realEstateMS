import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import MainLayout from "../layouts/MainLayout";
import PropertyStore from "../stores/PropertyStore";
import PersonStore from "../stores/PersonStore";
import { propertySchema } from "../validation/schemas";
import useTranslation from "../hooks/useTranslation";
import { showSuccess, showError } from "../utils/toast";
import ConfirmDialog from "../components/ConfirmDialog";

const AddProperty = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, fileUrl: null, type: null });
  const [initialValues, setInitialValues] = useState({
    person_id: "",
    property_type: "",
    purpose: "",
    sale_price: "",
    rent_price: "",
    location: "",
    city: "",
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
    PersonStore.fetchPersons();
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId) => {
    const property = await PropertyStore.fetchPropertyById(propertyId);
    if (property) {
      setInitialValues({
        person_id: property.current_owner?.Person?.person_id || "",
        property_type: property.property_type || "",
        purpose: property.purpose || "",
        sale_price: property.sale_price ? parseFloat(property.sale_price) : "",
        rent_price: property.rent_price ? parseFloat(property.rent_price) : "",
        location: property.location || "",
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
      showError(t("properties.selectFiles"));
      return;
    }

    if (!id) {
      showError(t("properties.createFirst"));
      return;
    }

    setUploadingFiles(true);
    const result = await PropertyStore.uploadFiles(id, selectedFiles);

    if (result) {
      showSuccess(t("properties.uploadSuccess"));
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
    console.log("Form submitted with values:", values);
    let success;
    if (id) {
      success = await PropertyStore.updateProperty(id, values);
    } else {
      success = await PropertyStore.createProperty(values);
    }

    if (success) {
      showSuccess(
        id ? t("properties.propertyUpdated") : t("properties.propertyCreated")
      );
      navigate("/properties");
    } else {
      showError("Error: " + PropertyStore.error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {id ? t("properties.editProperty") : t("properties.addProperty")}
        </h1>

        <div className="bg-white shadow-md rounded p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={propertySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <div className="mb-4">
                  <label
                    htmlFor="person_id"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    {t("properties.owner")}
                  </label>
                  <Field
                    as="select"
                    name="person_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Owner</option>
                    {PersonStore.persons.map((person) => (
                      <option key={person.person_id} value={person.person_id}>
                        {person.full_name} ({person.phone})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="person_id"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="property_type"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Property Type
                  </label>
                  <Field
                    as="select"
                    name="property_type"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Type</option>
                    <option value="plot">Plot</option>
                    <option value="house">House</option>
                    <option value="flat">Flat</option>
                    <option value="shop">Shop</option>
                  </Field>
                  <ErrorMessage
                    name="property_type"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="purpose"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Purpose
                  </label>
                  <Field
                    as="select"
                    name="purpose"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Purpose</option>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </Field>
                  <ErrorMessage
                    name="purpose"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="location"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Location
                  </label>
                  <Field
                    name="location"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="city"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    City
                  </label>
                  <Field
                    name="city"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="area_size"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Area Size
                  </label>
                  <Field
                    name="area_size"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <ErrorMessage
                    name="area_size"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="bedrooms"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Bedrooms
                    </label>
                    <Field
                      name="bedrooms"
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bathrooms"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Bathrooms
                    </label>
                    <Field
                      name="bathrooms"
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Description
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    rows="4"
                  />
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <label className="block text-gray-700 text-sm font-semibold mb-4">
                    Deal Availability Settings
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available_for_sale"
                        name="is_available_for_sale"
                        checked={values.is_available_for_sale || false}
                        onChange={(e) =>
                          setFieldValue(
                            "is_available_for_sale",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor="is_available_for_sale"
                        className="ml-3 text-sm text-gray-700 font-medium cursor-pointer"
                      >
                        🟢 Available for Sale
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available_for_rent"
                        name="is_available_for_rent"
                        checked={values.is_available_for_rent || false}
                        onChange={(e) =>
                          setFieldValue(
                            "is_available_for_rent",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor="is_available_for_rent"
                        className="ml-3 text-sm text-gray-700 font-medium cursor-pointer"
                      >
                        🔵 Available for Rent
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Select which types of deals this property is available for
                  </p>
                </div>

                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded">
                  <label className="block text-gray-700 text-sm font-semibold mb-4">
                    📱 Media Availability
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_photo_available"
                        name="is_photo_available"
                        checked={values.is_photo_available || false}
                        onChange={(e) =>
                          setFieldValue(
                            "is_photo_available",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <label
                        htmlFor="is_photo_available"
                        className="ml-3 text-sm text-gray-700 font-medium cursor-pointer"
                      >
                        📸 Photos Available
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_attachment_available"
                        name="is_attachment_available"
                        checked={values.is_attachment_available || false}
                        onChange={(e) =>
                          setFieldValue(
                            "is_attachment_available",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <label
                        htmlFor="is_attachment_available"
                        className="ml-3 text-sm text-gray-700 font-medium cursor-pointer"
                      >
                        📎 Attachments Available
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_video_available"
                        name="is_video_available"
                        checked={values.is_video_available || false}
                        onChange={(e) =>
                          setFieldValue(
                            "is_video_available",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <label
                        htmlFor="is_video_available"
                        className="ml-3 text-sm text-gray-700 font-medium cursor-pointer"
                      >
                        🎥 Videos Available
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Select which media types are available for this property
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="latitude"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Latitude (Optional)
                    </label>
                    <Field
                      name="latitude"
                      type="number"
                      step="0.00000001"
                      placeholder="e.g., 24.8607"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <ErrorMessage
                      name="latitude"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="longitude"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Longitude (Optional)
                    </label>
                    <Field
                      name="longitude"
                      type="number"
                      step="0.00000001"
                      placeholder="e.g., 67.0011"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <ErrorMessage
                      name="longitude"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>
                {values.is_available_for_sale && (
                  <div className="mb-4">
                    <label
                      htmlFor="sale_price"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Sale Price *
                    </label>
                    <Field
                      name="sale_price"
                      type="number"
                      step="0.01"
                      placeholder="Enter sale price"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <ErrorMessage
                      name="sale_price"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                )}

                {values.is_available_for_rent && (
                  <div className="mb-4">
                    <label
                      htmlFor="rent_price"
                      className="block text-gray-700 text-sm font-semibold mb-2"
                    >
                      Rent Price *
                    </label>
                    <Field
                      name="rent_price"
                      type="number"
                      step="0.01"
                      placeholder="Enter rent price"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <ErrorMessage
                      name="rent_price"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                )}
                {(values.is_photo_available || values.is_attachment_available || values.is_video_available) && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      📁 Media Upload
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded p-4 mb-3">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        accept={`${values.is_photo_available ? 'image/*' : ''}${(values.is_photo_available || values.is_video_available) && values.is_attachment_available ? ',' : ''}${values.is_video_available ? 'video/*' : ''}${(values.is_photo_available || values.is_video_available) && values.is_attachment_available ? ',' : ''}${values.is_attachment_available ? '.pdf,.doc,.docx,.xls,.xlsx' : ''}`}
                        className="w-full"
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        {values.is_photo_available && values.is_attachment_available && values.is_video_available
                          ? 'Select images, videos, or documents'
                          : values.is_photo_available && values.is_video_available
                          ? 'Select images or videos'
                          : values.is_photo_available && values.is_attachment_available
                          ? 'Select images or documents'
                          : values.is_video_available && values.is_attachment_available
                          ? 'Select videos or documents'
                          : values.is_photo_available
                          ? 'Select images only'
                          : values.is_video_available
                          ? 'Select videos only'
                          : 'Select documents only'}
                      </p>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Selected Files ({selectedFiles.length})
                        </h4>
                        <ul className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm text-gray-700">
                                {file.name}
                              </span>
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
                          {uploadingFiles ? "Uploading..." : "Upload Files"}
                        </button>
                      </div>
                    )}

                    {uploadedPhotos.length > 0 && values.is_photo_available && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          📸 Uploaded Photos ({uploadedPhotos.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedPhotos.map((photo, index) => (
                            <div
                              key={index}
                              className="relative bg-gray-100 rounded h-32 overflow-hidden group cursor-pointer"
                            >
                              <img
                                src={`http://localhost:5000${photo}`}
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
                  </div>
                )}

                {values.is_attachment_available && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      📎 Uploaded Attachments
                    </label>
                    {uploadedAttachments.length > 0 ? (
                      <div className="space-y-2">
                        {uploadedAttachments.map((attachment, index) => {
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

                {values.is_video_available && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      🎥 Uploaded Videos
                    </label>
                    {uploadedVideos.length > 0 ? (
                      <div className="space-y-2">
                        {uploadedVideos.map((video, index) => {
                          const fileName = video.split('/').pop();
                          const isYouTube = video.includes('youtube.com') || video.includes('youtu.be');
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition group"
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

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                  >
                    {id ? t("common.update") : t("common.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/properties")}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
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
    </MainLayout>
  );
});

export default AddProperty;
