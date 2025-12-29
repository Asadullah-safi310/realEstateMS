import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import PersonStore from '../stores/PersonStore';
import { personSchema } from '../validation/schemas';
import { showSuccess, showError } from '../utils/toast';
import { ArrowLeft, User, Phone, Mail, FileText, MapPin, Upload, File } from 'lucide-react';

const FormField = ({ label, name, type = 'text', icon: Icon, placeholder, error, touched, children }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-900 mb-3">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 text-gray-400" size={20} />}
      {children || (
        <Field 
          name={name} 
          type={type} 
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
            error && touched ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
          }`}
        />
      )}
    </div>
    {error && touched && (
      <div className="mt-2 text-red-600 text-sm font-medium">{error}</div>
    )}
  </div>
);

const AddPerson = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [initialValues, setInitialValues] = useState({
    full_name: '',
    phone: '',
    email: '',
    national_id: '',
    address: '',
    id_card: null
  });

  useEffect(() => {
    if (id) {
      loadPerson(id);
    }
  }, [id]);

  const loadPerson = async (personId) => {
    try {
      const data = await PersonStore.fetchPersonById(personId);
      if (data) {
        setPerson(data);
        setInitialValues({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          national_id: data.national_id || '',
          address: data.address || '',
          id_card: null
        });
      } else {
        showError('Failed to load person data');
      }
    } catch (error) {
      showError('Error loading person: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('full_name', values.full_name);
    formData.append('phone', values.phone);
    if (values.email) formData.append('email', values.email);
    formData.append('national_id', values.national_id);
    if (values.address) formData.append('address', values.address);
    if (values.id_card) formData.append('id_card', values.id_card);

    let success;
    if (id) {
      success = await PersonStore.updatePerson(id, formData);
    } else {
      success = await PersonStore.createPerson(formData);
    }

    if (success) {
      showSuccess(id ? 'Person updated successfully' : 'Person created successfully');
      navigate('/authenticated/persons');
    } else {
      showError('Error: ' + PersonStore.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Go Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {id ? '✏️ Edit Person' : '➕ Add New Person'}
            </h1>
            <p className="text-blue-100">
              {id ? 'Update person information' : 'Create a new person profile'}
            </p>
          </div>
          {id && person && (
            <div className="text-right text-sm text-blue-100">
              <p>ID: <span className="font-mono bg-blue-800 px-2 py-0.5 rounded">{person.id}</span></p>
              <p className="mt-1">Joined: {new Date(person.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={personSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, setFieldValue, values }) => (
              <Form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Full Name"
                    name="full_name"
                    icon={User}
                    placeholder="Enter full name"
                    error={errors.full_name}
                    touched={touched.full_name}
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
                </div>

                <FormField
                  label="Address"
                  name="address"
                  icon={MapPin}
                  placeholder="Enter address"
                  error={errors.address}
                  touched={touched.address}
                />

                <FormField
                  label="ID Card Picture / File"
                  name="id_card"
                  icon={Upload}
                  error={errors.id_card}
                  touched={touched.id_card}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="id_card"
                      name="id_card"
                      className="hidden"
                      onChange={(event) => {
                        setFieldValue("id_card", event.currentTarget.files[0]);
                      }}
                    />
                    <label
                      htmlFor="id_card"
                      className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 font-medium"
                    >
                      <Upload size={20} />
                      {values.id_card ? values.id_card.name : 'Click to upload ID card file'}
                    </label>
                    {id && person?.id_card_path && !values.id_card && (
                      <a 
                        href={`http://localhost:5000${person.id_card_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 rounded-lg text-blue-600 hover:bg-gray-200 transition-colors"
                        title="View Current ID Card"
                      >
                        <File size={20} />
                      </a>
                    )}
                  </div>
                </FormField>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                  >
                    {isSubmitting ? '⏳ Saving...' : id ? '💾 Update Person' : '➕ Create Person'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/authenticated/persons')}
                    className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddPerson;
