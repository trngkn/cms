
import React, { useState, useMemo } from 'react';
import { Customer, User } from '../types';
import { generateId, fileToBase64 } from '../utils';

interface CustomerViewProps {
  customers: Customer[];
  user: User;
  onAdd: (c: Customer) => void;
  onUpdate: (c: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ customers, user, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const canEdit = user.role === 'ADMIN' || user.role === 'MANAGER';

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.bank.toLowerCase().includes(q) || 
      c.cardType.toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  const handleOpenForm = (c?: Customer) => {
    if (c) {
      setEditingCustomer({...c});
    } else {
      setEditingCustomer({
        id: generateId(),
        name: '',
        bank: '',
        cardType: '',
        lastFourDigits: '',
        isHoldingCard: false,
        idCardImages: [],
        cardImages: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const exists = customers.find(c => c.id === editingCustomer.id);
      if (exists) onUpdate(editingCustomer);
      else onAdd(editingCustomer);
      setIsModalOpen(false);
      setEditingCustomer(null);
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>, field: 'idCardImages' | 'cardImages') => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0 && editingCustomer) {
      const base64Array = await Promise.all(files.map(f => fileToBase64(f)));
      setEditingCustomer({ 
        ...editingCustomer, 
        [field]: [...(editingCustomer[field] || []), ...base64Array] 
      });
    }
  };

  const removeImage = (field: 'idCardImages' | 'cardImages', index: number) => {
    if (editingCustomer) {
      const updatedArr = (editingCustomer[field] || []).filter((_, i) => i !== index);
      setEditingCustomer({...editingCustomer, [field]: updatedArr});
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Cơ sở dữ liệu Khách hàng</h2>
        <div className="flex gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Tìm khách hàng..."
            />
          </div>
          <button 
            onClick={() => handleOpenForm()}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Thêm Khách
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Họ và Tên</th>
              <th className="px-6 py-4">Ngân hàng</th>
              <th className="px-6 py-4">Giữ thẻ</th>
              <th className="px-6 py-4">Loại thẻ</th>
              <th className="px-6 py-4">4 Số cuối</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-gray-800">{c.name}</td>
                <td className="px-6 py-4">{c.bank}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.isHoldingCard ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {c.isHoldingCard ? 'Đang giữ thẻ' : 'Không giữ thẻ'}
                  </span>
                </td>
                <td className="px-6 py-4">{c.cardType}</td>
                <td className="px-6 py-4 font-mono text-blue-600 font-bold">{c.lastFourDigits}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setViewingCustomer(c)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Chi tiết"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    {canEdit && (
                      <button 
                        onClick={() => handleOpenForm(c)}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                      </button>
                    )}
                    {user.role === 'ADMIN' && (
                      <button 
                        onClick={() => onDelete(c.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b flex justify-between items-center">
               <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-800">{viewingCustomer.name}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${viewingCustomer.isHoldingCard ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {viewingCustomer.isHoldingCard ? 'Đang giữ thẻ' : 'Không giữ thẻ'}
                    </span>
                  </div>
                  <p className="text-gray-400">{viewingCustomer.bank} • {viewingCustomer.cardType} (****{viewingCustomer.lastFourDigits})</p>
               </div>
               <button onClick={() => setViewingCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-gray-50/50">
               <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ảnh CCCD ({viewingCustomer.idCardImages?.length || 0})</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingCustomer.idCardImages?.length ? viewingCustomer.idCardImages.map((img, i) => (
                      <img key={i} src={img} className="w-full aspect-video object-cover rounded-2xl border bg-white shadow-sm hover:scale-105 transition-transform" />
                    )) : (
                      <div className="col-span-full py-8 text-center text-gray-300 italic border-2 border-dashed border-gray-200 rounded-2xl">Chưa có ảnh CCCD</div>
                    )}
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ảnh Thẻ ({viewingCustomer.cardImages?.length || 0})</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {viewingCustomer.cardImages?.length ? viewingCustomer.cardImages.map((img, i) => (
                      <img key={i} src={img} className="w-full aspect-video object-cover rounded-2xl border bg-white shadow-sm hover:scale-105 transition-transform" />
                    )) : (
                      <div className="col-span-full py-8 text-center text-gray-300 italic border-2 border-dashed border-gray-200 rounded-2xl">Chưa có ảnh thẻ</div>
                    )}
                  </div>
               </div>
            </div>
            <div className="p-8 flex justify-end">
               <button onClick={() => setViewingCustomer(null)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
               <h3 className="text-xl font-bold text-slate-800">{editingCustomer.id && customers.find(c => c.id === editingCustomer.id) ? 'Cập nhật Khách Hàng' : 'Thêm Khách Hàng Mới'}</h3>
               <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Họ tên khách hàng</label>
                    <input required value={editingCustomer.name} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="VD: Nguyễn Văn A" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">4 Số cuối thẻ</label>
                    <input required maxLength={4} value={editingCustomer.lastFourDigits} onChange={e => setEditingCustomer({...editingCustomer, lastFourDigits: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono" placeholder="1234" />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ngân hàng</label>
                    <input required value={editingCustomer.bank} onChange={e => setEditingCustomer({...editingCustomer, bank: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Techcombank" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Loại thẻ</label>
                    <input required value={editingCustomer.cardType} onChange={e => setEditingCustomer({...editingCustomer, cardType: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Visa Platinum" />
                 </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Tình trạng giữ thẻ</label>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setEditingCustomer({...editingCustomer, isHoldingCard: true})} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${editingCustomer.isHoldingCard ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-100 text-gray-400'}`}>Đang giữ thẻ</button>
                    <button type="button" onClick={() => setEditingCustomer({...editingCustomer, isHoldingCard: false})} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${!editingCustomer.isHoldingCard ? 'bg-slate-50 border-slate-500 text-slate-700' : 'border-gray-100 text-gray-400'}`}>Không giữ thẻ</button>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Quản lý Ảnh CCCD (Nhiều ảnh)</label>
                  <div className="flex flex-wrap gap-4">
                    {editingCustomer.idCardImages?.map((img, i) => (
                      <div key={i} className="relative group w-24 h-16">
                        <img src={img} className="w-full h-full object-cover rounded-lg border shadow-sm" />
                        <button type="button" onClick={() => removeImage('idCardImages', i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    ))}
                    <label className="w-24 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all text-slate-300">
                      <input type="file" multiple accept="image/*" onChange={e => handleFiles(e, 'idCardImages')} className="hidden" />
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </label>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Quản lý Ảnh Thẻ (Nhiều ảnh)</label>
                  <div className="flex flex-wrap gap-4">
                    {editingCustomer.cardImages?.map((img, i) => (
                      <div key={i} className="relative group w-24 h-16">
                        <img src={img} className="w-full h-full object-cover rounded-lg border shadow-sm" />
                        <button type="button" onClick={() => removeImage('cardImages', i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    ))}
                    <label className="w-24 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all text-slate-300">
                      <input type="file" multiple accept="image/*" onChange={e => handleFiles(e, 'cardImages')} className="hidden" />
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </label>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-200 rounded-2xl transition-all">Hủy</button>
               <button type="submit" className="flex-1 py-4 font-bold bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Lưu Thông Tin</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
