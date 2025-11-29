import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user info (/me)
  useEffect(() => {
    if (!token) return;

    fetch(`${API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch((err) => console.error("Failed to load user:", err));
  }, [token]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end items-center space-x-6">
        
        {/* Create Plan Button */}
        <button
          onClick={() => navigate("/upload")}
          className="text-sm text-gray-800 hover:text-blue-600 transition"
        >
          📝 Create Plan
        </button>

        {/* Avatar + Username + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2 hover:text-blue-600 transition"
          >
            {/* Avatar */}
            {user?.avatar_url ? (
              <img
                src={`${API}${user.avatar_url}`}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <span className="text-xl">👤</span>
            )}

            {/* Username */}
            <span className="text-sm font-medium text-gray-800">
              {user?.username || "Profile"}
            </span>

            {/* Dropdown arrow */}
            <span className="text-xs">▼</span>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border shadow-md rounded-lg py-2 text-sm">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                👤 Profile
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/upload");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📝 Create Plan
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-red-600 px-4 py-2 hover:bg-gray-100"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
