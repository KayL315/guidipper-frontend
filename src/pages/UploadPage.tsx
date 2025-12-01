import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { uploadBookmarks } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

function UploadPage() {
  const [hasPreviousUpload, setHasPreviousUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkPreviousUpload = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/check-bookmarks/${user.id}`);
        const data = await response.json();
        console.log("📦 Check bookmark response:", data);

        setHasPreviousUpload(data.exists);
      } catch (error) {
        console.error('Failed to check previous upload:', error);
        setHasPreviousUpload(false);
      }
    };

    checkPreviousUpload();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const handleUpload = async () => {
  if (!selectedFile) return;

  try {
    const res = await uploadBookmarks(selectedFile); // ✅ 调用封装好的 API 方法
    console.log("✅ Upload success:", res);

    // 上传成功跳转到 preferences 页面
    navigate('/preferences');
  } catch (error) {
    console.error("❌ Upload failed:", error);
    alert("Upload failed. Please check your file and try again.");
  }
};

  const handleUsePrevious = () => {
    navigate('/preferences'); // 直接跳转使用历史收藏夹
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="max-w-2xl bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-8 w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Upload Your Google Maps Bookmarks</h2>

          {/* 教程部分 */}
          <div className="mb-6 text-gray-800 space-y-3 text-sm leading-relaxed">
            <p className="font-medium">How to export your bookmarks from Google Maps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Takeout</a></li>
              <li>Select only <strong>Maps (Your Places)</strong></li>
              <li>Choose <strong>JSON</strong> format and export</li>
              <li>Unzip the file and upload the correct JSON file below</li>
            </ol>
          </div>

          {/* 上传部分 */}
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm file:bg-blue-500 file:text-white file:rounded file:px-4 file:py-2 file:border-none file:cursor-pointer mb-4"
          />

          {selectedFile && (
            <div className="mb-4 text-sm text-gray-600">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={!selectedFile}
          >
            Upload and Continue
          </button>

          {/* 条件渲染历史按钮 */}
          {hasPreviousUpload && (
            <button
              onClick={handleUsePrevious}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Use Previously Uploaded Bookmarks
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UploadPage;