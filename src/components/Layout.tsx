import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800 font-sans">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default Layout;