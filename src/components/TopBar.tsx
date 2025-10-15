import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end items-center space-x-6">
        <button
          onClick={() => navigate('/upload')}
          className="text-sm text-gray-800 hover:text-blue-600 transition"
        >
          📝 Create Plan
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm text-gray-800 hover:text-blue-600 transition"
        >
          👤 Profile
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar;