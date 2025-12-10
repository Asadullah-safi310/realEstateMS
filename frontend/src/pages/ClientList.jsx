import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ClientStore from '../stores/ClientStore';
import useViewPreference from '../hooks/useViewPreference';
import { showSuccess, showError } from '../utils/toast';

const ClientList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('clients');

  useEffect(() => {
    ClientStore.fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      const success = await ClientStore.deleteClient(id);
      if (success) {
        showSuccess('Client deleted successfully');
      } else {
        showError('Error: ' + ClientStore.error);
      }
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Clients</h1>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 bg-gray-200 rounded p-1">
              <button
                onClick={() => toggleView('list')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                ☰ List
              </button>
              <button
                onClick={() => toggleView('card')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  viewType === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⊞ Grid
              </button>
            </div>
            <button onClick={() => navigate('/clients/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Add Client
            </button>
          </div>
        </div>

        {ClientStore.loading ? (
          <p>Loading...</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Requirement Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Property Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Price Range</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ClientStore.clients.map(client => (
                  <tr key={client.client_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{client.client_name}</td>
                    <td className="px-4 py-3">{client.phone}</td>
                    <td className="px-4 py-3">{client.requirement_type}</td>
                    <td className="px-4 py-3">{client.property_type}</td>
                    <td className="px-4 py-3">Rs {client.min_price} - Rs {client.max_price}</td>
                    <td className="px-4 py-3">{client.preferred_location}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(client.client_id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ClientStore.clients.map(client => (
              <div key={client.client_id} className="bg-white shadow-md rounded p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{client.client_name}</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-gray-600"><strong>Phone:</strong> {client.phone}</p>
                  <p className="text-gray-600"><strong>Requirement:</strong> {client.requirement_type}</p>
                  <p className="text-gray-600"><strong>Property Type:</strong> {client.property_type}</p>
                  <p className="text-gray-600">
                    <strong>Price Range:</strong> Rs {client.min_price || '0'} - Rs {client.max_price || 'N/A'}
                  </p>
                  <p className="text-gray-600"><strong>Location:</strong> {client.preferred_location || 'N/A'}</p>
                </div>
                <button
                  onClick={() => handleDelete(client.client_id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
});

export default ClientList;
