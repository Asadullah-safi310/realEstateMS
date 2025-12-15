import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PersonStore from '../stores/PersonStore';
import useViewPreference from '../hooks/useViewPreference';
import { showSuccess, showError } from '../utils/toast';
import { MoreVertical } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const OwnerList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('owners');
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, personId: null });

  useEffect(() => {
    PersonStore.fetchPersons();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-action-menu]')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, personId: id });
  };

  const confirmDelete = async () => {
    const { personId } = confirmDialog;
    setConfirmDialog({ isOpen: false, personId: null });
    
    const success = await PersonStore.deletePerson(personId);
    if (success) {
      showSuccess('Person deleted successfully');
    } else {
      showError('Error: ' + PersonStore.error);
    }
  };

  const ActionMenu = ({ personId }) => (
    <div className="relative z-20" data-action-menu>
      <button
        onClick={() => setOpenMenu(openMenu === personId ? null : personId)}
        className="p-1 text-gray-600 hover:text-gray-900"
      >
        <MoreVertical size={18} />
      </button>
      {openMenu === personId && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
          <button
            onClick={() => {
              navigate(`/person-details/${personId}`);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            👁️ View Details
          </button>
          <button
            onClick={() => {
              navigate(`/owners/${personId}`);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              handleDelete(personId);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Persons</h1>
            <button onClick={() => navigate('/owners/add')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              ➕ Add Person
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <div className="flex justify-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">View</label>
                <div className="flex gap-2 bg-gray-100 rounded p-1">
                  <button
                    onClick={() => toggleView('list')}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      viewType === 'list'
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-300'
                        : 'bg-transparent text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ☰ List
                  </button>
                  <button
                    onClick={() => toggleView('card')}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      viewType === 'card'
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-300'
                        : 'bg-transparent text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⊞ Grid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {PersonStore.loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-visible">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">National ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PersonStore.persons.map((person, idx) => (
                  <tr key={person.person_id} className={`border-t hover:bg-blue-50 transition cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} onClick={() => navigate(`/person-details/${person.person_id}`)}>
                    <td className="px-6 py-4 font-medium text-gray-800">👤 {person.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{person.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{person.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{person.national_id || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{person.address || '-'}</td>
                    <td className="px-6 py-4 relative" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu personId={person.person_id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PersonStore.persons.map(person => (
              <div key={person.person_id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-visible group cursor-pointer" onClick={() => navigate(`/person-details/${person.person_id}`)}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                        {person.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{person.full_name}</h3>
                        <p className="text-xs text-gray-500 font-medium">{person.national_id ? `ID: ${person.national_id}` : 'No ID'}</p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionMenu personId={person.person_id} />
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-lg">📱</span>
                      <span className="text-gray-700 font-medium">{person.phone}</span>
                    </div>
                    {person.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-lg">✉️</span>
                        <span className="text-gray-700 font-medium truncate">{person.email}</span>
                      </div>
                    )}
                    {person.address && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-lg">📍</span>
                        <span className="text-gray-700 font-medium truncate">{person.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">Click card or use menu to manage</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Owner"
        message="Are you sure you want to delete this owner? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, personId: null })}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </MainLayout>
  );
});

export default OwnerList;
