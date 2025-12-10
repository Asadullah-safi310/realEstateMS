import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import MainLayout from '../layouts/MainLayout';
import OwnerStore from '../stores/OwnerStore';
import { ownerSchema } from '../validation/schemas';
import { showSuccess, showError } from '../utils/toast';

const AddOwner = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState({
    owner_name: '',
    phone: '',
    cnic: '',
    address: '',
  });

  useEffect(() => {
    if (id) {
      loadOwner(id);
    }
  }, [id]);

  const loadOwner = async (ownerId) => {
    const owner = await OwnerStore.fetchOwnerById(ownerId);
    if (owner) {
      setInitialValues(owner);
    }
  };

  const handleSubmit = async (values) => {
    let success;
    if (id) {
      success = await OwnerStore.updateOwner(id, values);
    } else {
      success = await OwnerStore.createOwner(values);
    }

    if (success) {
      showSuccess(id ? 'Owner updated successfully' : 'Owner created successfully');
      navigate('/owners');
    } else {
      showError('Error: ' + OwnerStore.error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{id ? 'Edit Owner' : 'Add Owner'}</h1>

        <div className="bg-white shadow-md rounded p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={ownerSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="owner_name" className="block text-gray-700 text-sm font-semibold mb-2">Owner Name</label>
                  <Field name="owner_name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="owner_name" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
                  <Field name="phone" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="phone" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="cnic" className="block text-gray-700 text-sm font-semibold mb-2">CNIC</label>
                  <Field name="cnic" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="cnic" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-2">Address</label>
                  <Field name="address" type="text" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="address" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    {id ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => navigate('/owners')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
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

export default AddOwner;
