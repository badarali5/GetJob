import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <img src="/favicon.ico" alt="Logo" className="w-16 h-16" />
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loading;
