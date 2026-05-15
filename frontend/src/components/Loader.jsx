import React from 'react';

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>
    </div>
  );
}
