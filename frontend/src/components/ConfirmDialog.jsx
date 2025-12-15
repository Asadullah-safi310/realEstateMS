import { AlertCircle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full transform transition-all">
        <div className={`flex items-center gap-3 p-4 border-b ${isDangerous ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className={`p-2 rounded-full ${isDangerous ? 'bg-red-100' : 'bg-blue-100'}`}>
            <AlertCircle className={`w-5 h-5 ${isDangerous ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-lg font-bold ${isDangerous ? 'text-red-900' : 'text-blue-900'}`}>
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="ml-auto p-1 hover:bg-gray-200 rounded-lg transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex gap-3 p-4 border-t bg-gray-50 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg font-medium transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
