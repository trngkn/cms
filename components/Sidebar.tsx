
import React, { useState } from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  siteName: string;
  siteLogo: string;
  activeTab: 'dashboard' | 'transactions' | 'crm' | 'tasks' | 'users' | 'settings' | 'profile';
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  notifCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ user, siteName, siteLogo, activeTab, setActiveTab, onLogout, notifCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const canManageUsers = user.role === 'ADMIN' || user.role === 'MANAGER';
  const isAdmin = user.role === 'ADMIN';

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-[60] shadow-lg">
        <div className="flex items-center gap-2">
          {siteLogo ? (
            <img src={siteLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">
              {siteName.charAt(0)}
            </div>
          )}
          <span className="font-bold truncate max-w-[120px]">{siteName}</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl z-[56] transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="hidden md:flex items-center gap-3 mb-8">
            {siteLogo ? (
              <img src={siteLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover shadow-lg border border-slate-700" />
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                {siteName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight truncate">{siteName}</span>
          </div>

          <nav className="space-y-1 mt-16 md:mt-0">
            <NavItem icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => handleTabClick('dashboard')} />
            <NavItem icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" label="Giao dịch" active={activeTab === 'transactions'} onClick={() => handleTabClick('transactions')} />
            <NavItem icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" label="Khách hàng (CRM)" active={activeTab === 'crm'} onClick={() => handleTabClick('crm')} />
            
            <button
              onClick={() => handleTabClick('tasks')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                activeTab === 'tasks' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span className="text-sm">Công việc</span>
              </div>
              {notifCount && notifCount > 0 ? (
                <span className="bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{notifCount}</span>
              ) : null}
            </button>

            <div className="pt-4 pb-2">
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hệ thống</p>
              {canManageUsers && (
                <NavItem icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="Người dùng" active={activeTab === 'users'} onClick={() => handleTabClick('users')} />
              )}
              {isAdmin && (
                <NavItem icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" label="Cài đặt web" active={activeTab === 'settings'} onClick={() => handleTabClick('settings')} />
              )}
              <NavItem icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Hồ sơ" active={activeTab === 'profile'} onClick={() => handleTabClick('profile')} />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
    </svg>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Sidebar;
