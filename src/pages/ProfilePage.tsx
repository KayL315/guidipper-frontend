import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

function ProfilePage() {
  const [userEmail, setUserEmail] = useState('user@example.com'); // 假设你从 localStorage 或后端获取
  const [routes, setRoutes] = useState<string[]>([]); // 历史行程
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    // 模拟获取用户历史路线
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/api/user/routes');
        const data = await res.json();
        setRoutes(data.routes); // 你可以改成 data.routes = ["Day 1: ...", "Day 2: ..."]
      } catch (err) {
        console.error('Failed to fetch routes:', err);
        setRoutes([]);
      }
    };

    fetchRoutes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload-bookmarks', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      setUploadStatus('Upload successful!');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload failed. Try again.');
    }
  };

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
          {routes.length > 0 ? (
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
                uploadStatus.includes('successful') ? 'text-green-600' : 'text-red-500'
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
      </div>
    </div>
  </Layout>
);
}

export default ProfilePage;