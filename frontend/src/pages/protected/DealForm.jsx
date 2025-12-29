import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { 
  User, 
  Home, 
  FileText, 
  Save, 
  ArrowLeft,
  Loader2,
  Tag,
  Calendar
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { showSuccess, showError } from '../../utils/toast';
import PersonDropdown from '../../components/PersonDropdown';

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const DealForm = observer(() => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [dealType, setDealType] = useState('SALE');
  
  const [formData, setFormData] = useState({
    seller_person_id: '',
    buyer_person_id: '',
    price: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axiosInstance.get(`/properties/${propertyId}`);
        const prop = response.data;
        setProperty(prop);
        
        // Smart default selection
        if (prop.is_available_for_sale) {
          setDealType('SALE');
          setFormData(prev => ({ 
            ...prev, 
            price: prop.sale_price || '',
            seller_person_id: prop.owner_person_id || ''
          }));
        } else if (prop.is_available_for_rent) {
          setDealType('RENT');
          setFormData(prev => ({ 
            ...prev, 
            price: prop.rent_price || '',
            seller_person_id: prop.owner_person_id || ''
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            seller_person_id: prop.owner_person_id || ''
          }));
        }
      } catch (error) {
        showError('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (type) => {
    setDealType(type);
    setFormData(prev => ({
      ...prev,
      price: type === 'SALE' ? (property?.sale_price || '') : (property?.rent_price || '')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.seller_person_id || !formData.buyer_person_id) {
      showError("Please select both Seller and Buyer");
      return;
    }

    setSubmitting(true);
    
    try {
      const payload = {
        deal_type: dealType,
        property_id: parseInt(propertyId),
        seller_person_id: formData.seller_person_id,
        buyer_person_id: formData.buyer_person_id,
        price: parseFloat(formData.price) || null,
        notes: formData.notes,
      };

      if (dealType === 'RENT') {
        payload.start_date = formData.start_date || null;
        payload.end_date = formData.end_date || null;
      }
      
      await axiosInstance.post('/deals', payload);
      showSuccess(`${dealType} deal created successfully!`);
      navigate('/authenticated/deals');
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Deal</h1>
            <p className="text-gray-500">Property ID: #{propertyId}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        <button
          onClick={() => handleTabChange('SALE')}
          className={`px-8 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
            dealType === 'SALE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Tag size={18} />
          Sale Deal
        </button>
        <button
          onClick={() => handleTabChange('RENT')}
          className={`px-8 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
            dealType === 'RENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={18} />
          Rent Deal
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Property Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <SectionHeader icon={Home} title="Property Information" description="Selected property details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property</label>
              <input 
                type="text" 
                value={`${property?.property_type} in ${property?.city} - ${property?.address}`}
                readOnly
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deal Price</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                required
              />
            </div>
            {dealType === 'RENT' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input 
                  type="date" 
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: People Involved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <SectionHeader icon={User} title="Seller / Landlord" description="Person providing the property" />
            <PersonDropdown
              label="Select Seller"
              value={formData.seller_person_id}
              onChange={(id) => setFormData(prev => ({ ...prev, seller_person_id: id }))}
              placeholder="Search or select seller..."
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <SectionHeader icon={User} title="Buyer / Tenant" description="Person acquiring the property" />
            <PersonDropdown
              label="Select Buyer"
              value={formData.buyer_person_id}
              onChange={(id) => setFormData(prev => ({ ...prev, buyer_person_id: id }))}
              placeholder="Search or select buyer..."
            />
          </div>
        </div>

        {/* Section 3: Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <SectionHeader icon={FileText} title="Additional Notes" description="Legal or internal references" />
          <textarea
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any specific terms or notes..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Finalize {dealType === 'SALE' ? 'Sale' : 'Rent'} Deal
          </button>
        </div>
      </form>
    </div>
  );
});

export default DealForm;
