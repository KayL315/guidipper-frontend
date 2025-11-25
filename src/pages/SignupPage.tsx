import React, { useState } from 'react'; // 引入React和useState，用于组件和状态管理
import { Link, useNavigate } from 'react-router-dom'; // 用于跳转到 login 页面
import Layout from '../components/Layout'; // 公共布局组件，包含背景图等页面结构
import { signup } from '../api/auth';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const closeModal = () => {
    setShowModal(false);
    navigate('/login'); // 关闭提示框后总是跳转到登录页
  };

  // 提交表单的处理函数
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      const data = await signup(email, password);
      console.log('✅ 注册成功:', data);
      if (data.token) {
        localStorage.setItem('token', data.token); // ✅ 如果 token 存在再存
      }
      setShowModal(true); // 提示框注册成功
    } catch (err) {
      console.error('❌ 注册失败:', err);
      setError('Email already exists or server error.');
    }
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

        {/* 注册成功提示框 */}
        {showModal && (
          <div
            onClick={closeModal} // 点击背景关闭
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()} // 防止点击内容区也触发关闭
              className="bg-white rounded-2xl shadow-2xl w-80 p-6 text-center"
            >
              <h2 className="text-lg font-semibold mb-3 text-gray-800">🎉 Registration Successful 🎉</h2>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Login Now
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SignupPage;