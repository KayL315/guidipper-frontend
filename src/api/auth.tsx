import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface SignupResponse {
  id: number;
  email: string;
}

export interface UploadResponse {
  message: string;
}

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

export const uploadBookmarks = async (file: File): Promise<UploadResponse> => {
  const token = localStorage.getItem("auth_token");
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

export const generateRoute = async (
  data: PreferencesRequest
): Promise<{ generated_route: string }> => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No token found");

  const res = await axios.post(`${API}/generate-route`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No token found");

  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

