import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';

function PreferencesPage() {
  const navigate = useNavigate();
  const [centerLandmark, setCenterLandmark] = useState('');
  const [mustVisit, setMustVisit] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [allowAlcohol, setAllowAlcohol] = useState(true);
  const [preferredCuisine, setPreferredCuisine] = useState<string[]>([]);
  const [maxCommuteTime, setMaxCommuteTime] = useState('');

  const [timeError, setTimeError] = useState('');
  const [loading, setLoading] = useState(false); // ⭐ 加载动画 state

  useEffect(() => {
    if (transportModes.includes('Car')) {
      setAllowAlcohol(false);
    }
  }, [transportModes]);

  const handleTransportChange = (mode: string) => {
    if (transportModes.includes(mode)) {
      setTransportModes(transportModes.filter((m) => m !== mode));
    } else {
      setTransportModes([...transportModes, mode]);
    }
  };

  const handleSubmit = async () => {
    setTimeError('');

    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      if (endHour * 60 + endMin <= startHour * 60 + startMin) {
        setTimeError('End time must be greater than start time.');
        return;
      }
    }

    const token = localStorage.getItem('token');

    const preferences = {
      centerLandmark,
      mustVisit: mustVisit.split(',').map((p) => p.trim()),
      startTime,
      endTime,
      transportModes,
      allowAlcohol,
      preferredCuisine,
      maxCommuteTime: parseInt(maxCommuteTime),
    };

    try {
      setLoading(true); // ⭐ 开始显示 loader

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-route`,
        preferences,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultText = res.data.generated_route;
      navigate('/result', { state: { generatedRoute: resultText } });

    } catch (err) {
      console.error('Failed to generate route:', err);
      alert('Failed to generate route');
    } finally {
      setLoading(false); // ⭐ 停止 loader
    }
  };

  return (
    <Layout>
      {/* ⭐ 全屏加载动画（生成路线时显示） */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader text="Generating your AI route..." />
        </div>
      )}

      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">Your Trip Preferences</h2>

          {/* 中心地标 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Central Landmark</label>
            <input
              type="text"
              value={centerLandmark}
              onChange={(e) => setCenterLandmark(e.target.value)}
              placeholder="e.g., Golden Gate Bridge"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* 必去景点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Must-Visit Places (comma separated)</label>
            <input
              type="text"
              value={mustVisit}
              onChange={(e) => setMustVisit(e.target.value)}
              placeholder="e.g., Palace Museum, Temple of Heaven"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* 时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
          </div>

          {timeError && <div className="text-red-500 text-sm text-center">{timeError}</div>}

          {/* 交通 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Transport</label>
            <div className="flex gap-3 flex-wrap">
              {['Walk', 'Bus', 'Taxi', 'Car'].map((mode) => (
                <label key={mode} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={transportModes.includes(mode)}
                    onChange={() => handleTransportChange(mode)}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          {/* 单段通勤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max One-Way Travel Time (min)</label>
            <input
              type="number"
              min="1"
              value={maxCommuteTime}
              onChange={(e) => setMaxCommuteTime(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* 饮酒 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Preference</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowAlcohol}
                onChange={() => setAllowAlcohol(!allowAlcohol)}
                disabled={transportModes.includes('Car')}
              />
              <span>{allowAlcohol ? 'Allowed' : 'Not Allowed'}</span>
              {transportModes.includes('Car') && (
                <span className="text-xs text-red-500">(Disabled when driving)</span>
              )}
            </div>
          </div>

          {/* 菜系 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Cuisines</label>
            <select
              multiple
              value={preferredCuisine}
              onChange={(e) =>
                setPreferredCuisine(Array.from(e.target.selectedOptions, (opt) => opt.value))
              }
              className="w-full border px-4 py-2 rounded h-40"
            >
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Thai">Thai</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
              <option value="American">American</option>
              <option value="Middle Eastern">Middle Eastern</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Seafood">Seafood</option>
              <option value="Any">Any</option>
            </select>
          </div>

          {/* 提交 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 mt-4"
          >
            {loading ? "Generating..." : "Save Preferences and Continue"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PreferencesPage;

