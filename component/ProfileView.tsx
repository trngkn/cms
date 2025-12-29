
import React, { useState } from 'react';
import { User } from '../types';
import { fileToBase64 } from '../utils';

interface ProfileViewProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, avatar: base64 });
    }
  };

  const handleSave = () => {
    let updatedUser = { ...formData };
    
    if (showPasswordSection) {
      if (!newPassword) {
        alert("Vui lòng nhập mật khẩu mới!");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }
      updatedUser.password = newPassword;
    }

    onUpdate(updatedUser);
    alert("Cập nhật hồ sơ thành công!");
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
        <p className="text-slate-400">Cập nhật thông tin hiển thị và ảnh đại diện của bạn</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center gap-6">
             <div className="relative group">
                <img src={formData.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-lg" />
                <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer font-bold text-[10px] uppercase tracking-widest">
                  Thay Ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </label>
             </div>
             <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">{user.fullName}</h3>
                <p className="text-sm text-slate-400 font-medium">@{user.username} • {user.role}</p>
             </div>
          </div>

          <div className="space-y-6 pt-6">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Họ và tên hiển thị</label>
                <input 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800" 
                />
             </div>
             
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên tài khoản (Không thể sửa)</label>
                <input 
                  disabled
                  value={user.username} 
                  className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 text-gray-400 font-mono cursor-not-allowed" 
                />
             </div>

             <div className="pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  {showPasswordSection ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu đăng nhập'}
                </button>
             </div>

             {showPasswordSection && (
               <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mật khẩu mới</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="••••••••"
                    />
                  </div>
               </div>
             )}
          </div>

          <div className="pt-8 border-t border-gray-50 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Lưu Hồ Sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
