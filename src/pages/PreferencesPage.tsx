import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PreferencesPage() {
  const navigate = useNavigate();
  const [centerLandmark, setCenterLandmark] = useState('');
  const [mustVisit, setMustVisit] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [allowAlcohol, setAllowAlcohol] = useState(true);
  const [preferredCuisine, setPreferredCuisine] = useState<string[]>([]);
  const [maxCommuteTime, setMaxCommuteTime] = useState(''); // 单段通勤时间

  // 新增：时间错误状态
  const [timeError, setTimeError] = useState('');

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

  const handleSubmit = async () => {
    // 新增：验证 endTime > startTime
    setTimeError(''); // 清空旧错误
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;

      if (endTotal <= startTotal) {
        setTimeError('End time must be greater than start time.');
        return; // 阻止提交
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
      const res = await axios.post(
        'http://localhost:8000/generate-route',
        preferences,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ 后端返回：", res);
      const resultText = res.data.generated_route;
      console.log("✅ 提取到的路线：", resultText);
      // 跳转到结果页并传递路线文本
      navigate('/result', { state: { generatedRoute: resultText } });
      console.log("✅ 跳转传递的参数：", resultText);
    } catch (err) {
      console.error('Failed to generate route:', err);
      alert('Failed to generate route');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">Your Trip Preferences</h2>
          {/* 中心地标 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Central Landmark
            </label>
            <input
              type="text"
              value={centerLandmark}
              onChange={(e) => setCenterLandmark(e.target.value)}
              placeholder="e.g., Golden Gate Bridge"
              className="w-full border px-4 py-2 rounded"
            />
          </div>
          {/* 必去景点（用户输入） */}
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
            />
          </div>
          {/* 时间范围 */}
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
          {/* 新增：时间错误提示 */}
          {timeError && (
            <div className="text-red-500 text-sm text-center">
              {timeError}
            </div>
          )}
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
                disabled={transportModes.includes('Car')}
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
                setPreferredCuisine(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
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
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or ⌘ Command (Mac) to select multiple.</p>
          </div>
          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4"
          >
            Save Preferences and Continue
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default PreferencesPage;
