import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      console.log('✅ 登录成功');
      navigate('/upload');
    } catch (err: any) {
      console.error('❌ 登录失败:', err);
      setError(err?.response?.data?.detail || 'Incorrect email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Login to GuiDipper</h2>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(''); // 清除错误
                }}
                required
                className="mt-1 block w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // 清除错误
                }}
                required
                className="mt-1 block w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-700">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Click here to sign up
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;