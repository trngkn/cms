
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = users.find(u => u.username === username.toLowerCase());

    if (foundUser && foundUser.password === password) {
      onLogin(foundUser);
    } else {
      setError('Sai tài khoản hoặc mật khẩu! (Thử: admin/admin, manager/manager, user/user)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center font-black text-white text-4xl shadow-2xl shadow-blue-500/50 mb-6">
            C
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CardMaster System</h1>
          <p className="text-slate-400 mt-2">Hệ thống quản lý tín dụng chuyên nghiệp</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Tài khoản</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
                placeholder="Nhập username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Mật khẩu</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm py-3 px-4 rounded-xl font-bold border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-5 rounded-[1.25rem] shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Đăng Nhập
            </button>
          </form>

          <div className="mt-8 text-center text-slate-400 text-xs">
            <p>Tài khoản mẫu: <span className="text-blue-600 font-bold">admin</span>, <span className="text-orange-600 font-bold">manager</span>, <span className="text-green-600 font-bold">user</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
