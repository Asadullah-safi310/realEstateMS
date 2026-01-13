import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const DealPrintReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await axiosInstance.get(`/deals/${id}`);
        setDeal(response.data);
      } catch (err) {
        console.error('Error fetching deal:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDeal();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Deal not found</p>
          <button
            onClick={() => navigate('/authenticated/deals')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Controls - Visible on screen, hidden on print */}
      <div className="mb-4 flex gap-4 print:hidden">
        <button
          onClick={() => navigate('/authenticated/deals')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Printer size={20} />
          Print Report
        </button>
      </div>

      {/* Report Container */}
      <div className="bg-white mx-auto shadow-lg print:shadow-none print:m-0" style={{ width: '210mm', height: '297mm', overflow: 'hidden' }}>
        <ReportContent deal={deal} formatDate={formatDate} />
      </div>

      <style>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          @page {
            margin: 0;
            size: A4;
          }
          * {
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </div>
  );
};

const ReportContent = ({ deal, formatDate }) => (
  <div style={{ padding: '10mm', height: '100%', display: 'flex', flexDirection: 'column' }}>
    
    {/* COMPACT HEADER SECTION */}
    <div style={{ marginBottom: '6mm', paddingBottom: '3mm', borderBottom: '1.5px solid #999', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3mm', gap: '6mm' }}>
        {/* Left Photo - Smaller */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ width: '25mm', height: '30mm', border: '1px solid #999', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', fontSize: '8px', color: '#999' }}>
            Photo
          </div>
        </div>

        {/* Center - Compact Info */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 2mm 0' }}>REAL ESTATE DEAL REPORT</h1>
          <div style={{ fontSize: '8px', lineHeight: '1.2' }}>
            <div><strong>{deal.Agent?.full_name || 'N/A'}</strong></div>
            <div>ID: {deal.Agent?.user_id || 'N/A'}</div>
          </div>
        </div>

        {/* Right Photo - Smaller */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ width: '25mm', height: '30mm', border: '1px solid #999', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', fontSize: '8px', color: '#999' }}>
            Photo
          </div>
        </div>
      </div>

      {/* Metadata - Single Row, Compact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3mm', fontSize: '7px' }}>
        <div style={{ borderLeft: '2px solid #999', paddingLeft: '1.5mm' }}>
          <div style={{ color: '#666', fontSize: '6px' }}>Deal ID</div>
          <div style={{ fontWeight: 'bold' }}>{deal.deal_id}</div>
        </div>
        <div style={{ borderLeft: '2px solid #999', paddingLeft: '1.5mm' }}>
          <div style={{ color: '#666', fontSize: '6px' }}>Date</div>
          <div style={{ fontWeight: 'bold' }}>{formatDate(deal.created_at)}</div>
        </div>
        <div style={{ borderLeft: '2px solid #999', paddingLeft: '1.5mm' }}>
          <div style={{ color: '#666', fontSize: '6px' }}>Type</div>
          <div style={{ fontWeight: 'bold' }}>{deal.deal_type}</div>
        </div>
      </div>
    </div>

    {/* Content Sections - Flex to fit */}
    <div style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', gap: '4mm' }}>

      {/* SECTION 1: SELLER */}
      <Section
        title="SECTION 1: SELLER / OWNER INFORMATION"
        headerBg="#e5e5e5"
        borderColor="#999"
        fields={[
          { label: 'Full Name', value: deal.seller_name_snapshot || deal.Seller?.full_name || '_______________' },
          { label: "Father's Name", value: '_______________' },
          { label: 'National ID', value: '_______________' },
          { label: 'Phone', value: deal.seller_phone_snapshot || deal.Seller?.phone || '_______________' },
          { label: 'Address', value: '_______________', fullWidth: true },
          { label: 'Ownership Type', checkboxes: ['Owner', 'Rep.', 'Guardian'], fullWidth: true }
        ]}
      />

      {/* SECTION 2: PROPERTY */}
      <Section
        title="SECTION 2: PROPERTY INFORMATION"
        headerBg="#c5e3f6"
        borderColor="#3b9dd8"
        contentBg="#f0f9ff"
        fields={[
          { label: 'Property ID', value: deal.Property?.property_id || '_______________' },
          { label: 'Type', value: deal.Property?.property_type || '_______________' },
          { label: 'Deal Type', value: deal.deal_type === 'SALE' ? 'Sale' : 'Rent' },
          { label: 'Status', value: deal.status?.toUpperCase() || 'ACTIVE' },
          { label: 'Province', value: deal.Property?.province_id || '_______________' },
          { label: 'City', value: deal.Property?.city || '_______________' },
          { label: 'Location', value: deal.Property?.location || '_______________', fullWidth: true },
          { label: 'Size (sq m)', value: deal.Property?.size_sqm || '_______________' },
          { label: 'Price / Rent', value: new Intl.NumberFormat('en-US').format(deal.price || 0) },
          ...(deal.deal_type === 'RENT' ? [
            { label: 'Start Date', value: formatDate(deal.start_date) },
            { label: 'End Date', value: formatDate(deal.end_date) }
          ] : [])
        ]}
      />

      {/* SECTION 3: BUYER */}
      <Section
        title="SECTION 3: BUYER / TENANT INFORMATION"
        headerBg="#e5e5e5"
        borderColor="#999"
        fields={[
          { label: 'Full Name', value: deal.buyer_name_snapshot || deal.Buyer?.full_name || '_______________' },
          { label: "Father's Name", value: '_______________' },
          { label: 'National ID', value: '_______________' },
          { label: 'Phone', value: deal.buyer_phone_snapshot || deal.Buyer?.phone || '_______________' },
          { label: 'Address', value: '_______________', fullWidth: true },
          { label: 'Type', checkboxes: deal.deal_type === 'SALE' ? [{ label: 'Buyer', checked: true }, { label: 'Tenant', checked: false }] : [{ label: 'Buyer', checked: false }, { label: 'Tenant', checked: true }], fullWidth: true }
        ]}
      />

    </div>

    {/* Footer */}
    <div style={{ fontSize: '6px', color: '#666', marginTop: '4mm', paddingTop: '3mm', borderTop: '1px solid #ccc', flexShrink: 0, lineHeight: '1.2' }}>
      <div>Official Real Estate Deal Report. For legal purposes only.</div>
      <div>Printed: {formatDate(new Date())}</div>
    </div>
  </div>
);

const Section = ({ title, headerBg, borderColor, contentBg, fields }) => (
  <div style={{ flexShrink: 0 }}>
    <div style={{ backgroundColor: headerBg, padding: '1.5mm 2.5mm', fontWeight: 'bold', fontSize: '8px', marginBottom: '0', borderTop: `2px solid ${borderColor}` }}>
      {title}
    </div>
    <div style={{ border: `1.5px solid ${borderColor}`, borderTop: 'none', padding: '3mm', backgroundColor: contentBg || '#fff', fontSize: '7px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm 3mm' }}>
        {fields.map((field, idx) => (
          <div key={idx} style={{ gridColumn: field.fullWidth ? 'span 2' : 'span 1' }}>
            <div style={{ fontSize: '6px', fontWeight: 'bold', marginBottom: '0.5mm', color: '#666' }}>
              {field.label}
            </div>
            {field.checkboxes ? (
              <div style={{ display: 'flex', gap: '2mm', fontSize: '7px' }}>
                {(Array.isArray(field.checkboxes) && typeof field.checkboxes[0] === 'object' ? field.checkboxes : field.checkboxes.map(c => ({ label: c }))
                ).map((cb, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5mm' }}>
                    <input type="checkbox" style={{ width: '8px', height: '8px' }} checked={cb.checked || false} readOnly /> {cb.label || cb}
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ borderBottom: '1px solid #999', paddingBottom: '0.5mm', minHeight: '6mm', display: 'flex', alignItems: 'center' }}>
                {field.value}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6px', paddingTop: '1.5mm', marginTop: '1.5mm', borderTop: '1px solid #ccc' }}>
        <div>Signature: <div style={{ borderTop: '1px solid #999', width: '25mm', marginTop: '1mm' }}></div></div>
        <div>Date: <div style={{ borderTop: '1px solid #999', width: '20mm', marginTop: '1mm' }}></div></div>
      </div>
    </div>
  </div>
);

export default DealPrintReport;
