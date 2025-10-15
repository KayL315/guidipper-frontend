import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
<div
  className="min-h-screen bg-cover bg-center relative"
  style={{ backgroundImage: "url('/background.png')" }}
>
  <div className="absolute inset-0 bg-blue-200/10"></div>

  <main className="relative z-10">
    {children}
  </main>
</div>
  );
}

export default Layout;