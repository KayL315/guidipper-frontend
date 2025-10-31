// src/api/api.ts
import axios from "axios";

// 后端 API 根路径（例如 FastAPI 运行在 http://localhost:8000）
const API = process.env.REACT_APP_API_URL;

// 登录和注册返回值统一使用这个接口
export interface AuthResponse {
  access_token: string;
  token_type: string;
}
// ✅ 定义接口类型（推荐：帮助你获得返回值的类型提示）
export interface SignupResponse {
  id: number;
  email: string;
  token?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface UploadResponse {
  message: string;
}

// ✅ 注册用户
export const signup = async (
  email: string,
  password: string
): Promise<SignupResponse> => {
  const res = await axios.post<SignupResponse>(`${API}/register`, {
    email,
    password,
  });
  return res.data;
};

// ✅ 登录用户
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(`${API}/login`, {
    email,
    password,
  });
  return res.data;
};

// ✅ 上传 JSON 文件（收藏夹）
export const uploadBookmarks = async (file: File): Promise<UploadResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please login first.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post<UploadResponse>(`${API}/upload-bookmarks`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

//preference
export interface PreferencesRequest {
  centerLandmark: string;
  mustVisit: string[];
  startTime: string;
  endTime: string;
  transportModes: string[];
  allowAlcohol: boolean;
  preferredCuisine: string[];
  maxCommuteTime: number;
}

//生成路线
export const generateRoute = async (
  data: PreferencesRequest
): Promise<{ generated_route: string }> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await axios.post(`${API}/generate-route`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
