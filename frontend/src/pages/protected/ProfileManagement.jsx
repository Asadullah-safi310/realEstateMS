import React from 'react';
import { observer } from 'mobx-react-lite';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import authStore from '../../stores/AuthStore';
import { showSuccess, showError } from '../../utils/toast';

const profileSchema = Yup.object({
  full_name: Yup.string().required('Full name is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  address: Yup.string(),
  national_id: Yup.string(),
});

const ProfileManagement = observer(() => {
  const { user, isLoading } = authStore;

  const handleSubmit = async (values) => {
    const success = await authStore.updateProfile(values);
    if (success) {
      showSuccess('Profile updated successfully');
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
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {user.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-blue-600">{user.email}</p>
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
