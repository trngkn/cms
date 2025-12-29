
import React from 'react';
import { fileToBase64 } from '../utils';

interface SettingsViewProps {
  siteName: string;
  siteLogo: string;
  onUpdate: (name: string, logo: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ siteName, siteLogo, onUpdate }) => {
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onUpdate(siteName, base64);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cài đặt Website</h2>
        <p className="text-slate-400">Tùy chỉnh thương hiệu và giao diện hệ thống</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
             <div className="relative group">
                <div className="w-32 h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {siteLogo ? (
                    <img src={siteLogo} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] cursor-pointer font-bold text-xs uppercase tracking-widest">
                  Thay Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
             </div>
             
             <div className="flex-1 w-full space-y-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tên Website / Thương hiệu</label>
                   <input 
                    value={siteName} 
                    onChange={e => onUpdate(e.target.value, siteLogo)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 text-lg" 
                    placeholder="VD: CardMaster"
                  />
                </div>
                <p className="text-xs text-slate-400 italic">Tên này sẽ hiển thị trên Sidebar, Header và Tiêu đề trình duyệt.</p>
             </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex justify-end">
            <button 
              onClick={() => alert("Đã lưu cài đặt!")}
              className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
