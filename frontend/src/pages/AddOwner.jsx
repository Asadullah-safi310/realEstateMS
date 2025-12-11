import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import MainLayout from '../layouts/MainLayout';
import PersonStore from '../stores/PersonStore';
import { personSchema } from '../validation/schemas';
import { showSuccess, showError } from '../utils/toast';
import { ArrowLeft, User, Phone, Mail, FileText, MapPin } from 'lucide-react';

const FormField = ({ label, name, type = 'text', icon: Icon, placeholder, error, touched }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-900 mb-3">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 text-gray-400" size={20} />}
      <Field 
        name={name} 
        type={type} 
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
          error && touched ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
        }`}
      />
    </div>
    {error && touched && (
      <div className="mt-2 text-red-600 text-sm font-medium">{error}</div>
    )}
  </div>
);

const AddOwner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState({
    full_name: '',
    phone: '',
    email: '',
    national_id: '',
    address: '',
  });

  useEffect(() => {
    if (id) {
      loadPerson(id);
    }
  }, [id]);

  const loadPerson = async (personId) => {
    const person = await PersonStore.fetchPersonById(personId);
    if (person) {
      setInitialValues({
        full_name: person.full_name || '',
        phone: person.phone || '',
        email: person.email || '',
        national_id: person.national_id || '',
        address: person.address || '',
      });
    }
  };

  const handleSubmit = async (values) => {
    let success;
    if (id) {
      success = await PersonStore.updatePerson(id, values);
    } else {
      success = await PersonStore.createPerson(values);
    }

    if (success) {
      showSuccess(id ? 'Person updated successfully' : 'Person created successfully');
      navigate('/owners');
    } else {
      showError('Error: ' + PersonStore.error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {id ? '✏️ Edit Person' : '➕ Add New Person'}
            </h1>
            <p className="text-blue-100">
              {id ? 'Update person information' : 'Create a new person profile'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={personSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  <FormField
                    label="Full Name"
                    name="full_name"
                    icon={User}
                    placeholder="Enter full name"
                    error={errors.full_name}
                    touched={touched.full_name}
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    icon={Phone}
                    placeholder="Enter phone number"
                    error={errors.phone}
                    touched={touched.phone}
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="Enter email address"
                    error={errors.email}
                    touched={touched.email}
                  />

                  <FormField
                    label="National ID"
                    name="national_id"
                    icon={FileText}
                    placeholder="Enter national ID"
                    error={errors.national_id}
                    touched={touched.national_id}
                  />

                  <FormField
                    label="Address"
                    name="address"
                    icon={MapPin}
                    placeholder="Enter address"
                    error={errors.address}
                    touched={touched.address}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {isSubmitting ? '⏳ Saving...' : id ? '💾 Update Person' : '➕ Create Person'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/owners')}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddOwner;
