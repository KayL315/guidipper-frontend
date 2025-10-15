import React, { useState } from 'react'; // 引入React和useState，用于组件和状态管理
import { Link } from 'react-router-dom'; // 用于跳转到 login 页面
import Layout from '../components/Layout'; // 公共布局组件，包含背景图等页面结构

function SignupPage() {
  // 创建三个状态变量：email、password 和 confirmPassword
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // 错误提示信息状态（用于显示密码不匹配等）

  // 提交表单的处理函数
  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认表单提交行为

    // 简单的前端校验：密码至少8位 & 确认密码匹配
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // 清空错误
    setError('');

    // TODO: 这里将来调用后端 API（POST /signup）注册
    console.log('Signing up with:', email, password);
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Create an Account</h2>

          {/* 如果有错误，显示提示 */}
          {error && (
            <p className="text-red-600 mb-4 text-sm font-medium">{error}</p>
          )}

          <form onSubmit={handleSignup} className="space-y-4 text-left">
            {/* Email输入框 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // 实时更新email状态
                required
                className="mt-1 block w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Password输入框 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            {/* 确认密码输入框 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Sign Up
            </button>
          </form>

          {/* 跳转登录 */}
          <p className="mt-4 text-sm text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Click here to login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default SignupPage;