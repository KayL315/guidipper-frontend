import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [routeText, setRouteText] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log("✅ location.state:", location.state);
    // 从 preferences 页面跳转时带来的 state（route 文本）
    if (location.state && location.state.generatedRoute) {
      console.log("✅ 设置 routeText:", location.state.generatedRoute);
      setRouteText(location.state.generatedRoute);
    }
  }, [location.state]);

  const handleBack = () => {
    navigate('/preferences');
  };

  const handleSave = async () => {
    try {
      await axios.post(
        'http://localhost:8000/save-route',
        { route_text: routeText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Route saved successfully!');
    } catch (err) {
      console.error('Failed to save route:', err);
      alert('Failed to save route.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Your Personalized Itinerary
          </h2>

          <p className="text-gray-700 mb-6 text-center">
            Based on your preferences, here is your recommended route:
          </p>

          {/* 推荐路线内容 */}
          <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded shadow">
            {routeText}
          </pre>

          {/* 按钮区 */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Back to Preferences
            </button>

            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save This Plan
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default ResultPage;