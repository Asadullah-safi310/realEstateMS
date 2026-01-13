import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Phone, Mail, MapPin, Loader2, Upload, X } from 'lucide-react';
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import authStore from '../../stores/AuthStore';
import { showSuccess, showError } from '../../utils/toast';
import { getImageUrl } from '../../utils/mediaUtils';
import Avatar from '../../components/Avatar';

const profileSchema = Yup.object({
  full_name: Yup.string().required('Full name is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').nullable(),
  address: Yup.string(),
  national_id: Yup.string(),
});

const ProfileManagement = observer(() => {
  const { user, isLoading } = authStore;
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (values) => {
    const success = await authStore.updateProfile(values, selectedFile);
    if (success) {
      showSuccess('Profile updated successfully');
      handleRemoveFile();
    } else {
      showError(authStore.error || 'Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
            <div className="relative">
              {previewUrl ? (
                <Avatar user={{ ...user, profile_picture: null }} size="lg" className="!bg-transparent">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full rounded-full object-cover border-2 border-blue-200"
                  />
                </Avatar>
              ) : (
                <Avatar user={user} size="lg" className="border-2 border-blue-200" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-blue-600">{user.phone}</p>
              {user.email && <p className="text-gray-500 text-sm">{user.email}</p>}
            </div>
          </div>

          <div className="p-8">
            <Formik
              initialValues={{
                full_name: user.full_name || '',
                phone: user.phone || '',
                email: user.email || '',
                address: user.address || '',
                national_id: user.national_id || '',
              }}
              validationSchema={profileSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Field
                          name="full_name"
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <ErrorMessage name="full_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Field
                          name="phone"
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        name="email"
                        type="email"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Field
                        name="address"
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                    <Field
                      name="national_id"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <ErrorMessage name="national_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture <span className="text-gray-400">(Optional)</span></label>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt="Profile preview" 
                            className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <Avatar user={user} size="lg" className="w-20 h-20 border-2 border-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Click to upload</span>
                            <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileSelect} 
                            className="hidden"
                          />
                        </label>
                        {selectedFile && (
                          <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">{selectedFile.name}</span>
                            <button 
                              type="button"
                              onClick={handleRemoveFile}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting || isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
    </div>
  );
});

export default ProfileManagement;
