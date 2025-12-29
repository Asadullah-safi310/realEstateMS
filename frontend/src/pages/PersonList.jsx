import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import PersonStore from '../stores/PersonStore';
import { showSuccess, showError } from '../utils/toast';
import { MoreVertical, User, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const PersonList = observer(() => {
  const navigate = useNavigate();
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
    <div className="relative" data-action-menu>
      <button
        onClick={() => setOpenMenu(openMenu === personId ? null : personId)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
      >
        <MoreVertical size={20} />
      </button>
      {openMenu === personId && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => {
              navigate(`/authenticated/persons/${personId}`);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
          >
            <Eye size={16} /> View Details
          </button>
          <button
            onClick={() => {
              navigate(`/authenticated/persons/edit/${personId}`);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
          >
            <Edit size={16} /> Edit Profile
          </button>
          <div className="border-t border-gray-50 my-1"></div>
          <button
            onClick={() => {
              handleDelete(personId);
              setOpenMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} /> Delete Person
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Persons Management</h1>
        </div>
        <button 
          onClick={() => navigate('/authenticated/persons/add')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Add Person
        </button>
      </div>

      {PersonStore.loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading persons...</p>
        </div>
      ) : PersonStore.persons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No persons found</h3>
          <p className="text-gray-500 mb-6">
            You haven't added any persons to the system yet.
          </p>
          <button 
            onClick={() => navigate('/authenticated/persons/add')} 
            className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2"
          >
            <Plus size={20} /> Add your first person
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">National ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PersonStore.persons.map((person) => (
                  <tr 
                    key={person.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/authenticated/persons/${person.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-400">#{person.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                          {person.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{person.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {person.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {person.national_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu personId={person.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Person"
        message="Are you sure you want to delete this person profile? This action will remove all their records from the system."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, personId: null })}
        confirmText="Yes, Delete"
        cancelText="No, Keep"
        isDangerous={true}
      />
    </div>
  );
});

export default PersonList;
