import React from 'react';

const Loader = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-8">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

export default Loader;