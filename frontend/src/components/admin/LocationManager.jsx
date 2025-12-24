import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight, MapPin } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { showSuccess, showError } from '../../utils/toast';

const LocationColumn = ({ title, items, selectedId, onItemSelect, onAdd, onEdit, onDelete, loading }) => (
  <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <button
        onClick={onAdd}
        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title={`Add ${title}`}
      >
        <Plus size={16} />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-400 p-4 text-sm">No items found</div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className={`
              group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
              ${selectedId === item.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border border-transparent'}
            `}
            onClick={() => onItemSelect && onItemSelect(item)}
          >
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${selectedId === item.id ? 'text-blue-700' : 'text-gray-900'}`}>
                {item.name}
              </div>
              {item.native_name && (
                <div className="text-xs text-gray-500 truncate">{item.native_name}</div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 size={14} />
              </button>
              {onItemSelect && <ChevronRight size={16} className="text-gray-300" />}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus size={20} className="transform rotate-45" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const LocationManager = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', mode: '', item: null });
  const [formData, setFormData] = useState({ name: '', native_name: '' });

  // Fetch Provinces
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await axiosInstance.get('/locations/provinces');
      setProvinces(response.data);
    } catch (error) {
      showError('Failed to fetch provinces');
    } finally {
      setLoadingProvinces(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch Districts when Province selected
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const response = await axiosInstance.get(`/locations/provinces/${selectedProvince.id}/districts`);
          setDistricts(response.data);
          setAreas([]);
          setSelectedDistrict(null);
        } catch (error) {
          showError('Failed to fetch districts');
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setAreas([]);
    }
  }, [selectedProvince]);

  // Fetch Areas when District selected
  useEffect(() => {
    if (selectedDistrict) {
      const fetchAreas = async () => {
        setLoadingAreas(true);
        try {
          const response = await axiosInstance.get(`/locations/districts/${selectedDistrict.id}/areas`);
          setAreas(response.data);
        } catch (error) {
          showError('Failed to fetch areas');
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();
    } else {
      setAreas([]);
    }
  }, [selectedDistrict]);

  const handleOpenModal = (type, mode, item = null) => {
    setModalConfig({ isOpen: true, type, mode, item });
    setFormData({ 
      name: item ? item.name : '', 
      native_name: item ? item.native_name : '' 
    });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: '', mode: '', item: null });
    setFormData({ name: '', native_name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, mode, item } = modalConfig;
    const endpoint = 
      type === 'province' ? '/locations/provinces' :
      type === 'district' ? '/locations/districts' :
      '/locations/areas';
    
    const payload = { ...formData };
    if (type === 'district' && mode === 'create') payload.province_id = selectedProvince.id;
    if (type === 'area' && mode === 'create') payload.district_id = selectedDistrict.id;

    try {
      if (mode === 'create') {
        await axiosInstance.post(endpoint, payload);
        showSuccess(`${type} created successfully`);
      } else {
        await axiosInstance.put(`${endpoint}/${item.id}`, payload);
        showSuccess(`${type} updated successfully`);
      }

      // Refresh data
      if (type === 'province') fetchProvinces();
      else if (type === 'district') {
        const res = await axiosInstance.get(`/locations/provinces/${selectedProvince.id}/districts`);
        setDistricts(res.data);
      } else {
        const res = await axiosInstance.get(`/locations/districts/${selectedDistrict.id}/areas`);
        setAreas(res.data);
      }
      handleCloseModal();
    } catch (error) {
      showError(`Failed to ${mode} ${type}`);
    }
  };

  const handleDelete = async (type, item) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    const endpoint = 
      type === 'province' ? '/locations/provinces' :
      type === 'district' ? '/locations/districts' :
      '/locations/areas';

    try {
      await axiosInstance.delete(`${endpoint}/${item.id}`);
      showSuccess(`${type} deleted successfully`);

      if (type === 'province') {
        fetchProvinces();
        setSelectedProvince(null);
      } else if (type === 'district') {
        setDistricts(districts.filter(d => d.id !== item.id));
        setSelectedDistrict(null);
      } else {
        setAreas(areas.filter(a => a.id !== item.id));
      }
    } catch (error) {
      showError(`Failed to delete ${type}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <LocationColumn
          title="Provinces"
          items={provinces}
          selectedId={selectedProvince?.id}
          onItemSelect={setSelectedProvince}
          onAdd={() => handleOpenModal('province', 'create')}
          onEdit={(item) => handleOpenModal('province', 'edit', item)}
          onDelete={(item) => handleDelete('province', item)}
          loading={loadingProvinces}
        />

        <div className={`flex-1 transition-opacity duration-200 ${!selectedProvince ? 'opacity-50 pointer-events-none' : ''}`}>
          <LocationColumn
            title="Districts"
            items={districts}
            selectedId={selectedDistrict?.id}
            onItemSelect={setSelectedDistrict}
            onAdd={() => handleOpenModal('district', 'create')}
            onEdit={(item) => handleOpenModal('district', 'edit', item)}
            onDelete={(item) => handleDelete('district', item)}
            loading={loadingDistricts}
          />
        </div>

        <div className={`flex-1 transition-opacity duration-200 ${!selectedDistrict ? 'opacity-50 pointer-events-none' : ''}`}>
          <LocationColumn
            title="Areas / Places"
            items={areas}
            onAdd={() => handleOpenModal('area', 'create')}
            onEdit={(item) => handleOpenModal('area', 'edit', item)}
            onDelete={(item) => handleDelete('area', item)}
            loading={loadingAreas}
          />
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={`${modalConfig.mode === 'create' ? 'Add' : 'Edit'} ${modalConfig.type}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Kabul"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Native Name</label>
            <input
              type="text"
              value={formData.native_name}
              onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. کابل"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LocationManager;