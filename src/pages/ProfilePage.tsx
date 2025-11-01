import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';

function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string>('Loading...');
  const [routes, setRoutes] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);

  /** ✅ 1️⃣ 获取用户信息 */
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = await res.json();
        setUserEmail(data.email || 'Unknown user');
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setUserEmail('user@example.com');
      }
    };

    fetchUserInfo();
  }, []);

  /** ✅ 2️⃣ 获取历史路线 */
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/routes');
      if (!res.ok) throw new Error('Failed to fetch routes');
      const data = await res.json();
      setRoutes(data.routes || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  /** ✅ 3️⃣ 上传文件 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadStatus('Uploading...');
    try {
      const res = await fetch('/api/upload-bookmarks', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');

      setUploadStatus('✅ Upload successful! Analyzing your bookmarks...');
      setSelectedFile(null);
      // 上传成功后刷新路线
      fetchRoutes();
    } catch (err) {
      console.error(err);
      setUploadStatus('❌ Upload failed. Try again.');
    }
  };

  /** ✅ 4️⃣ 调用 AI 生成新路线 */
  const handleGenerateAiRoute = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Generate a new travel route based on user history.',
        }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      alert(`✨ AI Generated Route:\n${data.route}`);
      fetchRoutes(); // 更新历史路线
    } catch (err) {
      console.error('AI generation failed:', err);
      alert('❌ Failed to generate route.');
    } finally {
      setAiGenerating(false);
    }
  };

  /** ✅ UI 部分 */
  return (
    <Layout>
      <div className="min-h-screen flex justify-center items-start pt-20 px-4">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl bg-white/70 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">Your Profile</h2>

          {/* 用户信息 */}
          <div className="text-center text-gray-700">
            <p className="text-lg">
              📧 Email: <span className="font-medium">{userEmail}</span>
            </p>
          </div>

          {/* 历史行程 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">📍 Past Generated Routes</h3>
            {loading ? (
              <Loader text="Fetching your travel routes..." />
            ) : routes.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-800 space-y-1">
                {routes.map((route, index) => (
                  <li key={index}>{route}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No routes generated yet.</p>
            )}
          </div>

          {/* 上传收藏夹 */}
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-3">📁 Upload a New Bookmark File</h3>

            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />

            {selectedFile && (
              <div className="mb-2 text-sm text-gray-700">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </div>
            )}

            {uploadStatus && (
              <div
                className={`text-sm mb-3 ${
                  uploadStatus.includes('✅') ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {uploadStatus}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300 disabled:bg-blue-300"
            >
              Upload Bookmark
            </button>
          </div>

          {/* 生成新路线按钮 */}
          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold mb-3">🧭 AI Travel Generator</h3>
            <button
              onClick={handleGenerateAiRoute}
              disabled={aiGenerating}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300 disabled:bg-green-300"
            >
              {aiGenerating ? 'Generating...' : '✨ Generate New Route'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePage;
