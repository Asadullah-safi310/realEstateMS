import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ClientStore from '../stores/ClientStore';
import useViewPreference from '../hooks/useViewPreference';
import { showSuccess, showError } from '../utils/toast';
import { MoreVertical } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const ClientList = observer(() => {
  const navigate = useNavigate();
  const { viewType, toggleView } = useViewPreference('clients');
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, clientId: null });

  useEffect(() => {
    ClientStore.fetchClients();
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
    setConfirmDialog({ isOpen: true, clientId: id });
  };

  const confirmDelete = async () => {
    const { clientId } = confirmDialog;
    setConfirmDialog({ isOpen: false, clientId: null });
    
    const success = await ClientStore.deleteClient(clientId);
    if (success) {
      showSuccess('Client deleted successfully');
    } else {
      showError('Error: ' + ClientStore.error);
    }
  };

  const ActionMenu = ({ clientId }) => (
    <div className="relative z-20" data-action-menu>
      <button
        onClick={() => setOpenMenu(openMenu === clientId ? null : clientId)}
        className="p-1 text-gray-600 hover:text-gray-900"
      >
        <MoreVertical size={18} />
      </button>
      {openMenu === clientId && (
        <div className="absolute top-full mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
          <button
            onClick={() => {
              handleDelete(clientId);
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
            <h1 className="text-3xl font-bold">Clients</h1>
            <button onClick={() => navigate('/clients/add')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
              ➕ Add Client
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

        {ClientStore.loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : viewType === 'list' ? (
          <div className="bg-white shadow-md rounded overflow-visible">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Requirement</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Property Type</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Price Range</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ClientStore.clients.map((client, idx) => (
                  <tr key={client.client_id} className={`border-t hover:bg-purple-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-4 font-medium text-gray-800">👤 {client.client_name}</td>
                    <td className="px-4 py-4 text-gray-600">{client.phone}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        client.requirement_type === 'buy' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {client.requirement_type === 'buy' ? '🔍 Buy' : '🔑 Rent'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{client.property_type}</td>
                    <td className="px-4 py-4 font-medium text-gray-800">💰 Rs {client.min_price || '0'} - Rs {client.max_price || '-'}</td>
                    <td className="px-4 py-4 text-gray-600">{client.preferred_location || '-'}</td>
                    <td className="px-4 py-4 relative">
                      <ActionMenu clientId={client.client_id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ClientStore.clients.map(client => (
              <div key={client.client_id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-visible group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                          {client.client_name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition">{client.client_name}</h3>
                      </div>
                      <span className={`text-xs font-semibold inline-block px-3 py-1 rounded-full ${
                        client.requirement_type === 'buy'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {client.requirement_type === 'buy' ? '🔍 Looking to Buy' : '🔑 Looking to Rent'}
                      </span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionMenu clientId={client.client_id} />
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-lg">📱</span>
                      <span className="text-gray-700 font-medium">{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-lg">🏠</span>
                      <span className="text-gray-700 font-medium">{client.property_type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-lg">💰</span>
                      <span className="text-gray-700 font-medium">Rs {client.min_price || '0'} - Rs {client.max_price || '-'}</span>
                    </div>
                    {client.preferred_location && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-lg">📍</span>
                        <span className="text-gray-700 font-medium truncate">{client.preferred_location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">Use menu to manage client</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, clientId: null })}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </MainLayout>
  );
});

export default ClientList;
