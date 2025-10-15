import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function HomePage() {
  return (
    <Layout>
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="bg-white/70 backdrop-blur-md p-10 rounded-xl shadow-lg max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
  Welcome to <span className="text-blue-600 text-4xl animate-pulse">GuiDipper 🧭</span>!
</h1>
          <p className="text-lg text-gray-800 mb-8">
            Dump your Google Maps bookmarks 🗺️, tell us your vibe 💅, and we’ll turn it into a
            TikTok-worthy trip itinerary. It’s giving ✨ smart ✨ travel.
          </p>
          <div className="space-y-4">
            <Link to="/login" className="text-white bg-blue-500 px-6 py-2 rounded hover:bg-blue-600 block">
              Click here to login
            </Link>
            <Link to="/signup" className="text-blue-500 underline hover:text-blue-700 block">
              No account? Click here to signup
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HomePage;