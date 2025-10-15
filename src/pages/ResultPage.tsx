import React from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

function ResultPage() {
  const navigate = useNavigate();

  // 假设从后端拿到推荐路线结果（mock 数据）
  const recommendedRoute = [
    { time: '09:00 - 10:30', place: 'The Met Museum', type: 'Must-Visit' },
    { time: '11:00 - 12:00', place: 'Central Park Stroll', type: 'Landmark' },
    { time: '12:15 - 13:30', place: 'Lunch at Joe\'s Shanghai (Chinese)', type: 'Food' },
    { time: '14:00 - 15:30', place: 'MoMA - Modern Art Museum', type: 'Optional Visit' },
  ];

  const parkingRecommendation = {
    name: '81st Street Parking Garage',
    distance: '3 min walk from Met Museum',
    cost: '$20/day'
  };

  const handleBack = () => {
    navigate('/preferences');
  };

  const handleSave = () => {
    // TODO: 调用后端 API 保存这条推荐结果
    alert('Route saved successfully!');
  };

  return (
    <Layout>
      <div className="min-h-screen px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Your Personalized Itinerary
          </h2>

          <p className="text-gray-700 mb-6 text-center">
            Based on your preferences, we’ve created a recommended itinerary for your day!
          </p>

          {/* 行程表 */}
          <div className="space-y-4">
            {recommendedRoute.map((item, idx) => (
              <div key={idx} className="border-l-4 pl-4 border-blue-500 bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">{item.time}</p>
                <p className="text-lg font-semibold text-gray-800">{item.place}</p>
                <p className="text-sm text-gray-600 italic">{item.type}</p>
              </div>
            ))}
          </div>

          {/* 停车推荐 */}
          <div className="mt-8 bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-bold mb-2">🚗 Parking Recommendation</h3>
            <p><strong>{parkingRecommendation.name}</strong></p>
            <p>{parkingRecommendation.distance}</p>
            <p>{parkingRecommendation.cost}</p>
          </div>

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