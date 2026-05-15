import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({ message, type = 'info', onClose }) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg ${getStyles()}`}>
      {getIcon()}
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto font-bold">
          ×
        </button>
      )}
    </div>
  );
}
