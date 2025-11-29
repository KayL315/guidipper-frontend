import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Loader from "../components/Loader";

function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [routes, setRoutes] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  // 获取用户资料
  useEffect(() => {
    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setNewUsername(data.username || "");
      });

    // 历史路线
    fetch(`${API}/routes/${localStorage.getItem("user_id")}`)
      .then((res) => res.json())
      .then((data) => setRoutes(data.routes || []))
      .catch(() => setRoutes([]));
  }, []);

  // 上传头像
  const uploadAvatar = async () => {
    if (!selectedAvatar) return;

    const formData = new FormData();
    formData.append("file", selectedAvatar);

    const res = await fetch(`${API}/upload-avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    setUser({ ...user, avatar_url: data.avatar_url });

    // 存到 localStorage 让 Navbar 显示头像
    localStorage.setItem("avatar_url", `${API}${data.avatar_url}`);

    alert("Avatar updated!");
  };

  // 修改用户名
  const updateUsername = async () => {
    const formData = new FormData();
    formData.append("username", newUsername);

    const res = await fetch(`${API}/update-username`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    await res.json();
    alert("Username updated!");
  };

  // 选择书签文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // 上传书签
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploadStatus("Uploading...");

    try {
      const res = await fetch(`${API}/upload-bookmarks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setUploadStatus("Upload successful!");
      setSelectedFile(null);
    } catch {
      setUploadStatus("Upload failed. Try again.");
    }
  };

  if (!user) return <Layout><Loader text="Loading Profile..." /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen flex justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-xl shadow-xl p-8 space-y-8">

          <h2 className="text-3xl font-bold text-center text-gray-900">
            Your Profile
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <img
              src={
                user.avatar_url
                  ? `${API}${user.avatar_url}`
                  : "https://via.placeholder.com/120"
              }
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border shadow mb-3"
            />

            <input type="file" onChange={(e) => setSelectedAvatar(e.target.files?.[0] || null)} />
            <button
              onClick={uploadAvatar}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Upload Avatar
            </button>
          </div>

          {/* Username */}
          <div>
            <label className="font-semibold">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="block w-full border p-2 rounded mt-1"
            />
            <button
              onClick={updateUsername}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Username
            </button>
          </div>

          {/* Email */}
          <p className="text-gray-700 text-lg">📧 Email: {user.email}</p>

          <hr />

          {/* Past Routes */}
          <div>
            <h3 className="text-xl font-semibold mb-2">📍 Past Generated Routes</h3>

            {routes.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-800 space-y-1">
                {routes.map((route, i) => (
                  <li key={i}>{route}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No routes generated yet.</p>
            )}
          </div>

          <hr />

          {/* Bookmark Upload */}
          <div>
            <h3 className="text-xl font-semibold mb-3">📁 Upload a Bookmark File</h3>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block mb-3"
            />

            {uploadStatus && (
              <p
                className={`text-sm ${
                  uploadStatus.includes("successful") ? "text-green-600" : "text-red-500"
                }`}
              >
                {uploadStatus}
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-300"
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
