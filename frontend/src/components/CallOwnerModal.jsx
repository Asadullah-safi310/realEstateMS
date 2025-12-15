import { X, Phone, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const CallOwnerModal = ({ isOpen, onClose, ownerName, ownerPhone }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(ownerPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    window.location.href = `tel:${ownerPhone}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full transform transition-all">
        <div className="flex items-center gap-3 p-4 border-b bg-blue-50 border-blue-200">
          <div className="p-2 rounded-full bg-blue-100">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-blue-900">Contact Owner</h2>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-gray-200 rounded-lg transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-xs text-gray-500 font-semibold mb-1">Owner Name</p>
            <p className="text-lg font-bold text-gray-900">{ownerName}</p>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold mb-2">Phone Number</p>
            <p className="text-2xl font-bold text-blue-600">{ownerPhone}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCall}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
            >
              <Phone size={20} />
              Call Now
            </button>

            <button
              onClick={handleCopyPhone}
              className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-lg font-semibold transition"
            >
              {copied ? (
                <>
                  <CheckCircle size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Number
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallOwnerModal;
