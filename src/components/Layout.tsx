import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const showTopBar = !['/', '/login', '/signup'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* 背景遮罩层 */}
      <div className="absolute inset-0 bg-blue-100/20" />

      {showTopBar && user && (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="w-full flex justify-end items-center pr-10 py-3 space-x-6">
            <Link
              to="/upload"
              className="text-gray-800 hover:text-blue-600 transition font-medium"
            >
              📝 Create Plan
            </Link>

            <Link to="/profile" className="flex items-center space-x-2 group">
              {user?.avatar_url ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}${user.avatar_url}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-gray-300 object-cover group-hover:ring-2 group-hover:ring-blue-400 transition"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
              <span className="text-gray-800 hover:text-blue-600 transition font-medium">
                Profile
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 transition font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      )}

      {/* 页面内容 */}
      <main
        className={`relative z-10 ${
          showTopBar ? 'pt-28' : ''
        } pb-10 px-4`}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;
