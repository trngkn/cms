
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { generateId, DEFAULT_AVATAR, fileToBase64 } from '../utils';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onAdd: (u: User) => void;
  onUpdate: (u: User) => void;
  onDelete: (id: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({ users, currentUser, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({
    username: '',
    fullName: '',
    role: 'USER',
    avatar: DEFAULT_AVATAR,
    password: ''
  });

  // Define authorization flags for role management
  const isAdmin = currentUser.role === 'ADMIN';
  const isManager = currentUser.role === 'MANAGER';
  const canEditRoles = isAdmin;

  const handleOpenForm = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setUserForm(u);
    } else {
      setEditingUser(null);
      setUserForm({ username: '', fullName: '', role: 'USER', avatar: DEFAULT_AVATAR, password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Nếu là Manager và đang sửa user khác, ta giữ nguyên password cũ nếu password trong form trống hoặc bị cấm
      const updatedData = { ...editingUser, ...userForm };
      
      // Quy tắc Manager không được sửa pass của người khác (trừ khi tự sửa mình, nhưng Profile đã lo việc đó)
      if (isManager && editingUser.id !== currentUser.id) {
        updatedData.password = editingUser.password;
      }

      onUpdate(updatedData as User);
    } else {
      const exists = users.find(u => u.username === userForm.username);
      if (exists) {
        alert("Username đã tồn tại!");
        return;
      }
      onAdd({ 
        id: generateId(), 
        username: userForm.username || '', 
        fullName: userForm.fullName || '', 
        role: userForm.role || 'USER', 
        avatar: userForm.avatar || DEFAULT_AVATAR,
        password: userForm.password || '123456' // Mặc định nếu không nhập
      });
    }
    setIsModalOpen(false);
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setUserForm({ ...userForm, avatar: base64 });
    }
  };

  // Logic kiểm tra quyền sửa mật khẩu
  // 1. Nếu là tạo mới -> Cho phép nhập pass (kể cả Manager)
  // 2. Nếu là Admin -> Luôn cho phép sửa
  // 3. Nếu là Manager -> Không cho phép sửa pass của user đã có
  const canEditPassword = !editingUser || isAdmin;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân viên</h2>
          <p className="text-slate-400">Quản lý tài khoản, phân quyền và hồ sơ nhân sự</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Thêm Nhân Viên
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Nhân viên</th>
                <th className="px-8 py-5">Tài khoản</th>
                <th className="px-8 py-5">Vai trò</th>
                <th className="px-8 py-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50" />
                      <div>
                        <p className="font-bold text-slate-800">{u.fullName}</p>
                        <p className="text-xs text-slate-400">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 font-medium text-slate-600">@{u.username}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                      u.role === 'MANAGER' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenForm(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                      {isAdmin && u.id !== currentUser.id && (
                        <button onClick={() => onDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
               <h3 className="text-xl font-bold">{editingUser ? 'Sửa Nhân Viên' : 'Tạo Nhân Viên Mới'}</h3>
               <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 p-2 hover:bg-gray-100 rounded-full transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer">
                    <img src={userForm.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md group-hover:opacity-75 transition-opacity" />
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                    </label>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avatar nhân viên</p>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Username (Định danh)</label>
                    <input 
                      required 
                      disabled={!!editingUser}
                      placeholder="vd: nguyenvan_a"
                      value={userForm.username} 
                      onChange={e => setUserForm({...userForm, username: e.target.value.toLowerCase().replace(/\s/g, '')})} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên hiển thị</label>
                    <input 
                      required 
                      placeholder="Nguyễn Văn A"
                      value={userForm.fullName} 
                      onChange={e => setUserForm({...userForm, fullName: e.target.value})} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" 
                    />
                  </div>
                  
                  {/* Trường Mật khẩu */}
                  {canEditPassword ? (
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Mật khẩu {editingUser ? '(Để trống nếu không đổi)' : '(Khởi tạo)'}</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={userForm.password || ''} 
                        onChange={e => setUserForm({...userForm, password: e.target.value})} 
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-slate-400 text-xs">
                       Bạn không có quyền sửa mật khẩu của nhân viên này.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Vai trò hệ thống</label>
                    <select 
                      disabled={!canEditRoles && editingUser?.id !== currentUser.id}
                      value={userForm.role} 
                      onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                    >
                      <option value="USER">USER (Nhân viên)</option>
                      <option value="MANAGER">MANAGER (Quản lý)</option>
                      {isAdmin && <option value="ADMIN">ADMIN (Quản trị cao cấp)</option>}
                    </select>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">Hủy</button>
               <button type="submit" className="flex-1 py-4 font-bold bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">{editingUser ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
