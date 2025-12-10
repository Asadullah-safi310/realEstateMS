import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import MainLayout from '../layouts/MainLayout';
import DealStore from '../stores/DealStore';
import PropertyStore from '../stores/PropertyStore';
import ClientStore from '../stores/ClientStore';
import { dealSchema } from '../validation/schemas';
import { showSuccess, showError } from '../utils/toast';

const AddDeal = () => {
  const navigate = useNavigate();
  const [availableProperties, setAvailableProperties] = useState([]);

  useEffect(() => {
    PropertyStore.fetchProperties();
    ClientStore.fetchClients();
  }, []);

  useEffect(() => {
    setAvailableProperties(PropertyStore.properties.filter(p => p.status === 'available'));
  }, [PropertyStore.properties]);

  const initialValues = {
    property_id: '',
    client_id: '',
    final_price: '',
    deal_type: '',
  };

  const handleSubmit = async (values) => {
    const success = await DealStore.createDeal(values);

    if (success) {
      showSuccess('Deal created successfully');
      navigate('/deals');
    } else {
      showError('Error: ' + DealStore.error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add Deal</h1>

        <div className="bg-white shadow-md rounded p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={dealSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="property_id" className="block text-gray-700 text-sm font-semibold mb-2">Property</label>
                  <Field as="select" name="property_id" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Property</option>
                    {availableProperties.map(property => (
                      <option key={property.property_id} value={property.property_id}>
                        {property.property_type} - {property.location} (Rs {property.price})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="property_id" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="client_id" className="block text-gray-700 text-sm font-semibold mb-2">Client</label>
                  <Field as="select" name="client_id" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Client</option>
                    {ClientStore.clients.map(client => (
                      <option key={client.client_id} value={client.client_id}>
                        {client.client_name} - {client.phone}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="client_id" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="final_price" className="block text-gray-700 text-sm font-semibold mb-2">Final Price</label>
                  <Field name="final_price" type="number" className="w-full px-3 py-2 border border-gray-300 rounded" />
                  <ErrorMessage name="final_price" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <label htmlFor="deal_type" className="block text-gray-700 text-sm font-semibold mb-2">Deal Type</label>
                  <Field as="select" name="deal_type" className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="">Select Type</option>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </Field>
                  <ErrorMessage name="deal_type" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div className="flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    Create Deal
                  </button>
                  <button type="button" onClick={() => navigate('/deals')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">
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

export default AddDeal;
