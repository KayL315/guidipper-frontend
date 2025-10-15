import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const [hasPreviousUpload, setHasPreviousUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  // 模拟检查用户是否上传过收藏夹（等后端接口完善后可替换）
  useEffect(() => {
    const checkPreviousUpload = async () => {
      try {
        const userId = localStorage.getItem('userId'); // 假设你把当前用户 id 存在 localStorage
        if (!userId) return;

        // 模拟 API 请求（真实项目中你会请求你的后端）
        const response = await fetch(`/api/check-bookmarks/${userId}`);
        const data = await response.json();

        setHasPreviousUpload(data.exists); // true 或 false
      } catch (error) {
        console.error('Failed to check previous upload:', error);
        setHasPreviousUpload(false);
      }
    };

    checkPreviousUpload();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // TODO: 将文件发送到后端处理
    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('/api/upload-bookmarks', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then((data) => {
        console.log('Upload success:', data);
        navigate('/preferences'); // 上传成功跳转到 preferences 页面
      })
      .catch((err) => {
        console.error('Upload error:', err);
      });
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