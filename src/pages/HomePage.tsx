import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';


function HomePage() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to GuiDipper!</h1>
      <div className="space-y-4 text-center">
        <Link to="/login" className="text-white bg-blue-500 px-6 py-2 rounded hover:bg-blue-600 block">
          Click here to login
        </Link>
        <Link to="/signup" className="text-blue-500 underline hover:text-blue-700 block">
          No account? Click here to signup
        </Link>
      </div>
    </Layout>
  );
}

export default HomePage;