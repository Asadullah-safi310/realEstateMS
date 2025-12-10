import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import MainLayout from '../layouts/MainLayout';
import ClientStore from '../stores/ClientStore';
import { clientSchema } from '../validation/schemas';
import { showSuccess, showError } from '../utils/toast';

const AddClient = () => {
  const navigate = useNavigate();

  const initialValues = {
    client_name: '',
    phone: '',
    requirement_type: '',
    property_type: '',
    min_price: '',
    max_price: '',
    preferred_location: '',
  };

  const handleSubmit = async (values) => {
    const success = await ClientStore.createClient(values);

    if (success) {
      showSuccess('Client created successfully');
      navigate('/clients');
    } else {
      showError('Error: ' + ClientStore.error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add Client</h1>

        <div className="bg-white shadow-md rounded p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={clientSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="client_name" className="block text-gray-700 text-sm font-semibold mb-2">Client Name</label>
                  <Field name="client_name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="client_name" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
                  <Field name="phone" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="phone" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="requirement_type" className="block text-gray-700 text-sm font-semibold mb-2">Requirement Type</label>
                  <Field as="select" name="requirement_type" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Type</option>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </Field>
                  <ErrorMessage name="requirement_type" component="div" className="text-red-600 text-sm mt-1" />
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

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="min_price" className="block text-gray-700 text-sm font-semibold mb-2">Min Price</label>
                    <Field name="min_price" type="number" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label htmlFor="max_price" className="block text-gray-700 text-sm font-semibold mb-2">Max Price</label>
                    <Field name="max_price" type="number" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="preferred_location" className="block text-gray-700 text-sm font-semibold mb-2">Preferred Location</label>
                  <Field name="preferred_location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                </div>

                <div className="flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    Create
                  </button>
                  <button type="button" onClick={() => navigate('/clients')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
                    Cancel
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

export default AddClient;
