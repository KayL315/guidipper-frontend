import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PreferencesPage() {
  const navigate = useNavigate();

  // ✅ 改回：centerLandmark
  const [centerLandmark, setCenterLandmark] = useState('');

  const [mustVisit, setMustVisit] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [allowAlcohol, setAllowAlcohol] = useState(true);
  const [preferredCuisine, setPreferredCuisine] = useState<string[]>([]);
  const [maxCommuteTime, setMaxCommuteTime] = useState('');

  // 时间错误状态（左对齐红色显示）
  const [timeError, setTimeError] = useState('');
  // 时间错误弹窗
  const [showTimeModal, setShowTimeModal] = useState(false);

  // ✅ 生成路线 loading
  const [isGenerating, setIsGenerating] = useState(false);

  // 自动禁用饮酒选项
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

  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) {
      setTimeError('');
      setShowTimeModal(false);
      return true;
    }

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    if (endTotal <= startTotal) {
      setTimeError('End time must be greater than start time.');
      setShowTimeModal(true);
      return false;
    }

    setTimeError('');
    setShowTimeModal(false);
    return true;
  };

  const handleSubmit = async () => {
    // 兜底校验
    if (!validateTimeRange(startTime, endTime)) return;

    const token = localStorage.getItem('token');

    const preferences = {
      // ✅ 这里也改回 centerLandmark
      centerLandmark,
      mustVisit: mustVisit
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      startTime,
      endTime,
      transportModes,
      allowAlcohol,
      preferredCuisine,
      maxCommuteTime: parseInt(maxCommuteTime),
    };

    try {
      setIsGenerating(true);

      const res = await axios.post('http://localhost:8000/generate-route', preferences, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resultText = res.data.generated_route;
      navigate('/result', { state: { generatedRoute: resultText } });
    } catch (err) {
      console.error('Failed to generate route:', err);
      alert('Failed to generate route');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      {/* ✅ 生成中全屏 Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generating your itinerary...</h3>
                <p className="text-sm text-gray-600">This may take a few seconds.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 时间错误弹窗 */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Time Range Error</h3>
            <p className="mt-2 text-sm text-gray-700">
              {timeError || 'End time must be greater than start time.'}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="rounded px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">Your Trip Preferences</h2>

          {/* ✅ 改回：Central Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Central Landmark</label>
            <input
              type="text"
              value={centerLandmark}
              onChange={(e) => setCenterLandmark(e.target.value)}
              placeholder="e.g., Golden Gate Bridge"
              className="w-full border px-4 py-2 rounded"
              disabled={isGenerating}
            />
          </div>

          {/* 必去景点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Must-Visit Places (separate by commas)
            </label>
            <input
              type="text"
              value={mustVisit}
              onChange={(e) => setMustVisit(e.target.value)}
              placeholder="e.g., Palace Museum, Temple of Heaven"
              className="w-full border px-4 py-2 rounded"
              disabled={isGenerating}
            />
          </div>

          {/* 时间范围 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  const next = e.target.value;
                  setStartTime(next);
                  validateTimeRange(next, endTime);
                }}
                className="w-full border px-4 py-2 rounded"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  const next = e.target.value;
                  setEndTime(next);
                  validateTimeRange(startTime, next);
                }}
                onBlur={() => validateTimeRange(startTime, endTime)}
                className="w-full border px-4 py-2 rounded"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* 时间错误提示：左对齐红色 */}
          {timeError && <div className="text-red-600 text-sm text-left mt-1">{timeError}</div>}

          {/* 交通方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Transport</label>
            <div className="flex gap-3 flex-wrap">
              {['Walk', 'Bus', 'Taxi', 'Car'].map((mode) => (
                <label key={mode} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={transportModes.includes(mode)}
                    onChange={() => handleTransportChange(mode)}
                    disabled={isGenerating}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          {/* 最长单段通勤时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Acceptable One-Way Travel Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={maxCommuteTime}
              onChange={(e) => setMaxCommuteTime(e.target.value)}
              placeholder="e.g., 30"
              className="w-full border px-4 py-2 rounded"
              disabled={isGenerating}
            />
          </div>

          {/* 饮酒偏好 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Preference</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowAlcohol}
                onChange={() => setAllowAlcohol(!allowAlcohol)}
                disabled={isGenerating || transportModes.includes('Car')}
              />
              <span>{allowAlcohol ? 'Allowed' : 'Not Allowed'}</span>
              {transportModes.includes('Car') && (
                <span className="text-xs text-red-500">(Disabled when driving)</span>
              )}
            </div>
          </div>

          {/* 菜系偏好（多选下拉） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Cuisines</label>
            <select
              multiple
              value={preferredCuisine}
              onChange={(e) =>
                setPreferredCuisine(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full border px-4 py-2 rounded h-40"
              disabled={isGenerating}
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
            <p className="text-sm text-gray-500 mt-1">
              Hold Ctrl (Windows) or ⌘ Command (Mac) to select multiple.
            </p>
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className={`w-full text-white py-2 rounded mt-4 flex items-center justify-center gap-2
              ${isGenerating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isGenerating && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            )}
            {isGenerating ? 'Generating...' : 'Save Preferences and Continue'}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PreferencesPage;
