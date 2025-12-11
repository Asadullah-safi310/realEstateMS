import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PersonStore from '../stores/PersonStore';
import useViewPreference from '../hooks/useViewPreference';
import { showSuccess, showError } from '../utils/toast';

const OwnerList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('owners');

  useEffect(() => {
    PersonStore.fetchPersons();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      const success = await PersonStore.deletePerson(id);
      if (success) {
        showSuccess('Person deleted successfully');
      } else {
        showError('Error: ' + PersonStore.error);
      }
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Persons</h1>
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
            <button onClick={() => navigate('/owners/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Add Person
            </button>
          </div>
        </div>

        {PersonStore.loading ? (
          <p>Loading...</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">National ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PersonStore.persons.map(person => (
                  <tr key={person.person_id} className="border-t">
                    <td className="px-6 py-3">{person.full_name}</td>
                    <td className="px-6 py-3">{person.phone}</td>
                    <td className="px-6 py-3">{person.email || 'N/A'}</td>
                    <td className="px-6 py-3">{person.national_id || 'N/A'}</td>
                    <td className="px-6 py-3">{person.address || 'N/A'}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => navigate(`/owners/${person.person_id}`)} className="text-blue-600 hover:underline mr-4">Edit</button>
                      <button onClick={() => handleDelete(person.person_id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PersonStore.persons.map(person => (
              <div key={person.person_id} className="bg-white shadow-md rounded p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{person.full_name}</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-gray-600"><strong>Phone:</strong> {person.phone}</p>
                  <p className="text-gray-600"><strong>Email:</strong> {person.email || 'N/A'}</p>
                  <p className="text-gray-600"><strong>National ID:</strong> {person.national_id || 'N/A'}</p>
                  <p className="text-gray-600"><strong>Address:</strong> {person.address || 'N/A'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/owners/${person.person_id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(person.person_id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
});

export default OwnerList;
