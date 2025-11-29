import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

function PreferencesPage() {
  const navigate = useNavigate();
  const [centerLandmark, setCenterLandmark] = useState("");
  const [mustVisit, setMustVisit] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [allowAlcohol, setAllowAlcohol] = useState(true);
  const [preferredCuisine, setPreferredCuisine] = useState<string[]>([]);
  const [maxCommuteTime, setMaxCommuteTime] = useState("");

  // 错误和加载状态
  const [timeError, setTimeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // 自动禁用饮酒选项
  useEffect(() => {
    if (transportModes.includes("Car")) {
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

  // 时间校验
  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) {
      setTimeError("");
      setShowTimeModal(false);
      return true;
    }

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startTotal = sh * 60 + sm;
    const endTotal = eh * 60 + em;

    if (endTotal <= startTotal) {
      setTimeError("End time must be greater than start time.");
      setShowTimeModal(true);
      return false;
    }

    setTimeError("");
    setShowTimeModal(false);
    return true;
  };

  // 提交偏好
  const handleSubmit = async () => {
    if (!validateTimeRange(startTime, endTime)) return;

    const token = localStorage.getItem("token");
    const preferences = {
      centerLandmark,
      mustVisit: mustVisit.split(",").map((p) => p.trim()),
      startTime,
      endTime,
      transportModes,
      allowAlcohol,
      preferredCuisine,
      maxCommuteTime: parseInt(maxCommuteTime),
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-route`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resultText = res.data.generated_route;
      navigate("/result", { state: { generatedRoute: resultText } });
    } catch (err) {
      console.error("Failed to generate route:", err);
      alert("Failed to generate route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* 全屏加载动画 */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader text="Generating your AI route..." />
        </div>
      )}

      {/* 时间错误弹窗 */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Time Range Error</h3>
            <p className="mt-2 text-sm text-gray-700">
              {timeError || "End time must be greater than start time."}
            </p>

            <div className="mt-5 flex justify-end">
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
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Your Trip Preferences
          </h2>

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

          {/* 必去地点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Must-Visit Places (comma separated)
            </label>
            <input
              type="text"
              value={mustVisit}
              onChange={(e) => setMustVisit(e.target.value)}
              placeholder="e.g., Palace Museum, Temple of Heaven"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* 时间选择 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  validateTimeRange(e.target.value, endTime);
                }}
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  validateTimeRange(startTime, e.target.value);
                }}
                onBlur={() => validateTimeRange(startTime, endTime)}
                className="w-full border px-4 py-2 rounded"
              />
            </div>
          </div>

          {timeError && <div className="text-red-600 text-sm">{timeError}</div>}

          {/* 交通方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Transport
            </label>
            <div className="flex gap-3 flex-wrap">
              {["Walk", "Bus", "Taxi", "Car"].map((mode) => (
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

          {/* 最大通勤时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max One-Way Travel Time (min)
            </label>
            <input
              type="number"
              min="1"
              value={maxCommuteTime}
              onChange={(e) => setMaxCommuteTime(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* 饮酒偏好 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alcohol Preference
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowAlcohol}
                onChange={() => setAllowAlcohol(!allowAlcohol)}
                disabled={transportModes.includes("Car")}
              />
              <span>{allowAlcohol ? "Allowed" : "Not Allowed"}</span>
              {transportModes.includes("Car") && (
                <span className="text-xs text-red-500">(Disabled when driving)</span>
              )}
            </div>
          </div>

          {/* 菜系偏好 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Cuisines
            </label>
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
            <p className="text-sm text-gray-500 mt-1">
              Hold Ctrl (Windows) or ⌘ Cmd (Mac) to select multiple.
            </p>
          </div>

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
