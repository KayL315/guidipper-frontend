import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
const API = process.env.REACT_APP_API_URL;

function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <p className="mt-3 text-sm text-gray-600">{label}</p>
    </div>
  );
}

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [routeText, setRouteText] = useState('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem('auth_token');

  const generatedRoute = useMemo(() => {
    const st: any = location.state;
    return st?.generatedRoute ?? '';
  }, [location.state]);

  useEffect(() => {
    setIsLoadingRoute(true);

    if (generatedRoute) {
      setRouteText(generatedRoute);
      setIsLoadingRoute(false);
      return;
    }

    // 用户刷新/直接访问 ResultPage（没有 state）
    setRouteText('');
    setIsLoadingRoute(false);
  }, [generatedRoute]);

  const handleBack = () => {
    navigate('/preferences');
  };

  const handleSave = async () => {
    if (!routeText.trim()) {
      alert('No route to save. Please generate a route first.');
      return;
    }

    try {
      setIsSaving(true);
      await axios.post(
        `${API}/save-route`,
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
    } finally {
      setIsSaving(false);
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

          {/* 推荐路线内容 / 加载动画 */}
          {isLoadingRoute ? (
            <Spinner label="Preparing your itinerary..." />
          ) : routeText ? (
            <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded shadow">
              {routeText}
            </pre>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              No route data found (maybe you refreshed this page). Please go back and generate again.
            </div>
          )}

          {/* 按钮区 */}
          <div className="mt-8 flex justify-between items-center gap-3">
            <button
              onClick={handleBack}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={isSaving}
            >
              Back to Preferences
            </button>

            <button
              onClick={handleSave}
              disabled={isLoadingRoute || isSaving || !routeText.trim()}
              className={`px-4 py-2 rounded text-white flex items-center gap-2
                ${
                  isLoadingRoute || isSaving || !routeText.trim()
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isSaving && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              )}
              {isSaving ? 'Saving...' : 'Save This Plan'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ResultPage;