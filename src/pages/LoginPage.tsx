import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // 新增：错误信息状态

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    //handle login logic here
    e.preventDefault();

    // 假设登录失败，模拟一个错误（未来会从后端拿之后再改）
    if (password !== '12345678') {
      setError('Incorrect email or password'); // 设置错误提示
    } else {
      setError(''); // 清除错误提示（登录成功）
      console.log('Logging in with:', email, password);
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
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Login
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