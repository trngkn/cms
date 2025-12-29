
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, TransactionStatus, User, Customer } from '../types';
import { generateId, getCurrentDate, formatCurrency, parseCurrency, fileToBase64 } from '../utils';
import { INITIAL_SUGGESTIONS } from '../constants';

interface TransactionFormProps {
  user: User;
  customers: Customer[];
  initialData?: Transaction;
  onSubmit: (data: Transaction) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ user, customers, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Transaction>({
    id: generateId(),
    timestamp: getCurrentDate(),
    sale: user.fullName, 
    customerName: '',
    bank: '',
    cardType: '',
    lastFourDigits: '',
    type: TransactionType.WITHDRAW,
    amount: 0,
    withdrawAmount: 0,
    pos: '',
    posFeePercent: 1.5,
    posCost: 0,
    customerFeePercent: 2.0,
    customerCharge: 0,
    profit: 0,
    status: TransactionStatus.UNPAID,
    depositImages: [],
    withdrawImages: []
  });

  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [posSuggestions, setPosSuggestions] = useState<string[]>([]);
  const customerContainerRef = useRef<HTMLDivElement>(null);
  const posContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Logic tính toán các khoản phí và lợi nhuận
  useEffect(() => {
    const posCost = Math.round(formData.amount * (formData.posFeePercent / 100));
    const customerCharge = Math.round(formData.amount * (formData.customerFeePercent / 100));
    const profit = customerCharge - posCost;

    setFormData(prev => ({
      ...prev,
      posCost,
      customerCharge,
      profit
    }));
  }, [formData.amount, formData.posFeePercent, formData.customerFeePercent]);

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Gợi ý cho POS
    if (field === 'pos') {
      const query = value.toString().toLowerCase();
      setPosSuggestions(query ? INITIAL_SUGGESTIONS.pos.filter(p => p.toLowerCase().includes(query)) : []);
    }
  };

  useEffect(() => {
    const query = formData.customerName.toLowerCase();
    if (!query) {
      setCustomerSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.bank.toLowerCase().includes(query)
      );
      setCustomerSuggestions(filtered);
    }, 300);
    return () => clearTimeout(handler);
  }, [formData.customerName, customers]);

  const selectCustomer = (c: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: c.name,
      bank: c.bank,
      cardType: c.cardType,
      lastFourDigits: c.lastFourDigits
    }));
    setCustomerSuggestions([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'depositImages' | 'withdrawImages') => {
    const files = Array.from(e.target.files || []) as File[];
    const base64Files = await Promise.all(files.map(file => fileToBase64(file)));
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ...base64Files]
    }));
  };

  const removeImage = (field: 'depositImages' | 'withdrawImages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-white md:bg-slate-900/60 md:backdrop-blur-sm flex items-center justify-center z-[200] md:p-4">
      <div className="bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header - Cố định */}
        <div className="flex justify-between items-center p-6 md:p-10 border-b border-slate-100 bg-white md:rounded-t-[3rem] z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {initialData ? 'Sửa Giao Dịch' : 'Tạo Giao Dịch'}
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Hệ thống CardMaster</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 p-3 hover:bg-slate-100 rounded-2xl transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body - Cuộn nội dung */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-10">
            
            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">1. Thông tin định danh</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">ID Giao dịch</label>
                  <input value={formData.id} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-400 font-mono text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Người làm (Sale)</label>
                  <input value={formData.sale} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-blue-600 font-black text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Ngày (Timestamp)</label>
                  <input value={formData.timestamp} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-400 font-bold text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative" ref={customerContainerRef}>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Tên khách hàng</label>
                  <input 
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 placeholder:text-slate-300 transition-all"
                    placeholder="Nhập tên khách hàng..."
                    required
                  />
                  {customerSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-64 overflow-auto">
                      {customerSuggestions.map((c, i) => (
                        <button key={i} type="button" onClick={() => selectCustomer(c)} className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-none">
                          <div className="font-bold text-slate-800">{c.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-black">{c.bank} • ****{c.lastFourDigits}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Ngân hàng</label>
                    <input 
                      value={formData.bank} 
                      onChange={(e) => handleInputChange('bank', e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none text-slate-900 font-bold" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">4 Số cuối</label>
                    <input 
                      value={formData.lastFourDigits} 
                      onChange={(e) => handleInputChange('lastFourDigits', e.target.value.slice(0, 4))} 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-mono text-slate-900 font-black text-center" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Loại thẻ</label>
                    <input value={formData.cardType} onChange={(e) => handleInputChange('cardType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none text-slate-900 font-bold" placeholder="VD: Visa Platinum..." required />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Loại giao dịch</label>
                    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                      {[TransactionType.WITHDRAW, TransactionType.RENEW, TransactionType.BOTH].map(t => (
                        <button key={t} type="button" onClick={() => handleInputChange('type', t)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* PHẦN 2: SỐ TIỀN VÀ PHÍ */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest border-l-4 border-orange-600 pl-3">2. Số tiền & Tính toán phí</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Số tiền làm (Amount)</label>
                  <input 
                    value={formatCurrency(formData.amount)} 
                    onChange={(e) => handleInputChange('amount', parseCurrency(e.target.value))} 
                    className="w-full bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5 outline-none font-black text-blue-700 text-2xl" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Số tiền rút (Thực tế)</label>
                  <input 
                    value={formatCurrency(formData.withdrawAmount)} 
                    onChange={(e) => handleInputChange('withdrawAmount', parseCurrency(e.target.value))} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none font-black text-slate-700 text-2xl" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                 <div className="relative" ref={posContainerRef}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">POS</label>
                    <input 
                      value={formData.pos} 
                      onChange={(e) => handleInputChange('pos', e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none font-bold text-slate-800" 
                      placeholder="Chọn POS..." 
                    />
                    {posSuggestions.length > 0 && (
                      <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                        {posSuggestions.map((p, i) => (
                          <button key={i} type="button" onClick={() => { handleInputChange('pos', p); setPosSuggestions([]); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 border-b last:border-none">{p}</button>
                        ))}
                      </div>
                    )}
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Phí POS (%)</label>
                    <input type="number" step="0.01" value={formData.posFeePercent} onChange={(e) => handleInputChange('posFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none font-black text-slate-800" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tiền POS thu</label>
                    <div className="w-full bg-white/50 border border-slate-100 rounded-xl px-4 py-3 font-black text-slate-500">{formatCurrency(formData.posCost)}</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-green-50/50 p-6 rounded-[2.5rem] border border-green-100">
                 <div>
                    <label className="block text-[10px] font-black text-green-600/60 uppercase mb-2">Trạng thái</label>
                    <select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full bg-white border border-green-200 rounded-xl px-4 py-3 outline-none font-black text-green-700 cursor-pointer">
                       <option value={TransactionStatus.UNPAID}>Chưa thanh toán</option>
                       <option value={TransactionStatus.PAID}>Đã thanh toán</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-green-600/60 uppercase mb-2">Phí khách (%)</label>
                    <input type="number" step="0.01" value={formData.customerFeePercent} onChange={(e) => handleInputChange('customerFeePercent', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-green-200 rounded-xl px-4 py-3 outline-none font-black text-green-700" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-green-600/60 uppercase mb-2">Số tiền thu khách</label>
                    <div className="w-full bg-white border border-green-200 rounded-xl px-4 py-3 font-black text-green-700">{formatCurrency(formData.customerCharge)}</div>
                 </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                   <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Lợi nhuận dự kiến</p>
                   <p className="text-3xl font-black text-green-400">{formatCurrency(formData.profit)} <span className="text-sm">VND</span></p>
                 </div>
                 <div className="w-full md:w-px h-px md:h-12 bg-slate-700"></div>
                 <div className="text-center md:text-right">
                    <p className="text-slate-400 text-[10px] font-bold">Thu khách: {formatCurrency(formData.customerCharge)}</p>
                    <p className="text-slate-400 text-[10px] font-bold">Trả POS: {formatCurrency(formData.posCost)}</p>
                 </div>
              </div>
            </div>

            {/* PHẦN 3: HÌNH ẢNH */}
            <div className="space-y-6">
               <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest border-l-4 border-purple-600 pl-3">3. Chứng từ & Hình ảnh</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ImageUploadBox label="Ảnh nạp (Deposit)" images={formData.depositImages} onUpload={(e) => handleFileChange(e, 'depositImages')} onRemove={(i) => removeImage('depositImages', i)} />
                  <ImageUploadBox label="Ảnh rút (Withdraw)" images={formData.withdrawImages} onUpload={(e) => handleFileChange(e, 'withdrawImages')} onRemove={(i) => removeImage('withdrawImages', i)} />
               </div>
            </div>

            {/* PHẦN 4: NÚT THAO TÁC */}
            <div className="pt-10 flex flex-col md:flex-row gap-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all text-sm uppercase tracking-widest active:scale-95">
                 {initialData ? 'Cập nhật giao dịch' : 'Xác nhận & Lưu giao dịch'}
              </button>
              <button type="button" onClick={onCancel} className="px-10 py-6 bg-slate-100 text-slate-500 font-bold rounded-[2rem] hover:bg-slate-200 transition-all text-sm uppercase tracking-widest">Hủy bỏ</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ImageUploadBox = ({ label, images, onUpload, onRemove }: { label: string, images: string[], onUpload: (e: any) => void, onRemove: (i: number) => void }) => (
  <div className="space-y-4">
    <label className="block text-xs font-black text-slate-500 uppercase ml-1">{label} ({images.length})</label>
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {images.map((img, i) => (
        <div key={i} className="relative aspect-square group">
          <img src={img} className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm" />
          <button type="button" onClick={() => onRemove(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      ))}
      <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-slate-300">
        <input type="file" multiple className="hidden" onChange={onUpload} accept="image/*" />
        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        <span className="text-[10px] font-black uppercase">Thêm</span>
      </label>
    </div>
  </div>
);

export default TransactionForm;
