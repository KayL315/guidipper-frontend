import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // 不在首页 /login /signup 显示 topbar
  const showTopBar = !['/', '/login', '/signup'].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* 背景遮罩层 */}
      <div className="absolute inset-0 bg-blue-100/20" />

      {/* 顶部导航栏 */}
      {showTopBar && (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="w-full flex justify-end items-center pr-10 py-3 space-x-6">
            <Link
            to="/upload"
            className="text-gray-800 hover:text-blue-600 transition font-medium"
            >
            📝 Create Plan
            </Link>
            <Link
            to="/profile"
            className="text-gray-800 hover:text-blue-600 transition font-medium"
            >
            👤 Profile
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

      {/* 页面内容：顶部留出空间 */}
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