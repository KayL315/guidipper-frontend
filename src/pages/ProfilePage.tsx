import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type SavedRoute = {
  id: number;
  title: string;
  text: string;
};

function ProfilePage() {
  const { user: authUser, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(authUser);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) {
        // 未登录，停止 loading，后续展示登录提示
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await response.json();
        setUser(userData);

        fetch(`${API}/routes/${authUser.id}`)
          .then((res) => res.json())
          .then((data) => {
            const list: SavedRoute[] = (data.routes || []).map(
              (item: any, idx: number) => {
                const text = typeof item === "string" ? item : item.route_text || "";
                const id = typeof item === "string" ? idx + 1 : item.id ?? idx + 1;
                const title = deriveTitle(text, idx);
                return { id, title, text };
              }
            );
            setRoutes(list);
          })
          .catch(() => setRoutes([]));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, token, API]);

  const uploadAvatar = async () => {
    if (!selectedAvatar || !token) return;

    const formData = new FormData();
    formData.append("file", selectedAvatar);

    const res = await fetch(`${API}/upload-avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    setUser({ ...user, avatar_url: data.avatar_url });
    updateUser({ avatar_url: data.avatar_url });

    alert("Avatar updated!");
  };

  // choose bookmark file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;

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

  // according to route text, derive a title
  const deriveTitle = (text: string, idx: number) => {
    const firstLine = text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    if (!firstLine) return `Itinerary ${idx + 1}`;
    return firstLine.length > 60 ? `${firstLine.slice(0, 60)}…` : firstLine;
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!token) return;
    const confirmed = window.confirm("Delete this saved route?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/routes/${routeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(null);
      }
    } catch (err) {
      console.error("Failed to delete route:", err);
      alert("Failed to delete route. Please try again.");
    }
  };

  if (isLoading) return <Layout><Loader text="Loading Profile..." /></Layout>;
  if (!authUser || !token) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
            <p className="text-gray-600">You need to log in to view your profile and saved routes.</p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

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

          {/* Email */}
          <p className="text-gray-700 text-lg">📧 Email: {user.email}</p>

          <hr />

          {/* Past Routes */}
          <div>
            <h3 className="text-xl font-semibold mb-2">📍 Past Generated Routes</h3>

            {routes.length === 0 && (
              <p className="text-sm text-gray-600">No routes generated yet.</p>
            )}

            {routes.length > 0 && (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {routes.map((route, idx) => (
                    <div
                      key={route.id ?? `${route.title}-${idx}`}
                      onClick={() =>
                        setSelectedRoute(
                          selectedRoute?.id === route.id ? null : route
                        )
                      }
                      className={`rounded border px-3 py-2 shadow-sm transition cursor-pointer ${
                        selectedRoute?.id === route.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-left flex-1 hover:underline line-clamp-2">
                          {route.title}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoute(route.id);
                          }}
                          className="text-xs text-red-600 hover:underline shrink-0 ml-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRoute ? (
                  <div className="rounded border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-gray-800">
                        {selectedRoute.title}
                      </h4>
                      <button
                        onClick={() => setSelectedRoute(null)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Collapse
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-gray-800">
                      {selectedRoute.text}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Select a route to view details.
                  </p>
                )}
              </div>
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
