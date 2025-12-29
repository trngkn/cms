
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, User, TransactionStatus, Customer } from '../types';
import { formatCurrency, exportToCSV, parseDateString } from '../utils';
import TransactionForm from './TransactionForm';

interface TransactionViewProps {
  transactions: Transaction[];
  customers: Customer[];
  user: User;
  initialSearch?: string;
  onAdd: (t: Transaction) => void;
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionView: React.FC<TransactionViewProps> = ({ 
  transactions,
  customers,
  user, 
  initialSearch = '', 
  onAdd, 
  onUpdate, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Export state
  const [exportRange, setExportRange] = useState({ from: '', to: '' });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const canEdit = user.role === 'ADMIN' || user.role === 'MANAGER';

  useEffect(() => {
    setSearchTerm(initialSearch);
    setCurrentPage(1); // Reset page on search
  }, [initialSearch]);

  const sortedAndFilteredTransactions = useMemo(() => {
    let list = [...transactions];
    
    // 1. Filter by role - using fullName/display name for comparison
    if (user.role === 'USER') {
      list = list.filter(t => t.sale === user.fullName);
    }

    // 2. Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.customerName.toLowerCase().includes(q) || 
        t.id.toLowerCase().includes(q) ||
        t.bank.toLowerCase().includes(q) ||
        t.sale.toLowerCase().includes(q)
      );
    }

    // 3. Sort by date newest first
    list.sort((a, b) => parseDateString(b.timestamp) - parseDateString(a.timestamp));

    return list;
  }, [transactions, user, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(sortedAndFilteredTransactions.length / pageSize);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAndFilteredTransactions.slice(start, start + pageSize);
  }, [sortedAndFilteredTransactions, currentPage]);

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const initiateDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleExport = () => {
    if (!exportRange.from || !exportRange.to) {
      alert("Vui lòng chọn khoảng thời gian!");
      return;
    }

    const fromTime = new Date(exportRange.from).getTime();
    const toTime = new Date(exportRange.to).getTime();

    const exportData = transactions.filter(t => {
      const [d, m, y] = t.timestamp.split('/').map(Number);
      const tTime = new Date(y, m - 1, d).getTime();
      return tTime >= fromTime && tTime <= toTime;
    }).map(t => ({
      "ID Giao dịch": t.id,
      "Ngày": t.timestamp,
      "Sale": t.sale,
      "Khách hàng": t.customerName,
      "Ngân hàng": t.bank,
      "Loại thẻ": t.cardType,
      "Số cuối": t.lastFourDigits,
      "Loại GD": t.type,
      "Số tiền": t.amount,
      "Rút thực tế": t.withdrawAmount,
      "POS": t.pos,
      "Phí POS (%)": t.posFeePercent,
      "Tiền phí POS": t.posCost,
      "Phí khách (%)": t.customerFeePercent,
      "Tiền phí khách": t.customerCharge,
      "Lợi nhuận": t.profit,
      "Trạng thái": t.status
    }));

    if (exportData.length === 0) {
      alert("Không có giao dịch nào trong khoảng thời gian này!");
      return;
    }

    exportToCSV(exportData, `Bao_cao_giao_dich_${exportRange.from}_den_${exportRange.to}`);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-full lg:max-w-md">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base"
            placeholder="Tìm theo ID, khách, ngân hàng..."
          />
        </div>
        
        <div className="flex flex-row items-center gap-2 md:gap-3">
          {/* Export Tool */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="w-full md:w-auto bg-green-50 text-green-700 px-3 md:px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-all border border-green-200 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="hidden sm:inline">Xuất Báo Cáo</span>
              <span className="sm:hidden">Xuất</span>
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-6 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Chọn thời gian</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Từ ngày</label>
                    <input type="date" value={exportRange.from} onChange={e => setExportRange({...exportRange, from: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Đến ngày</label>
                    <input type="date" value={exportRange.to} onChange={e => setExportRange({...exportRange, to: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <button onClick={handleExport} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm">Tải xuống CSV</button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleAddClick}
            className="flex-1 md:flex-none bg-blue-600 text-white px-4 md:px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Giao Dịch Mới</span>
            <span className="sm:hidden">Tạo mới</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Ngày / ID</th>
                <th className="px-6 py-4">Khách Hàng / Sale</th>
                <th className="px-6 py-4">Thẻ / Ngân Hàng</th>
                <th className="px-6 py-4">Số Tiền / Loại</th>
                <th className="px-6 py-4">Phí Khách / Thu</th>
                <th className="px-6 py-4">Lợi Nhuận</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((t) => (
                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{t.timestamp}</div>
                    <div className="text-xs text-gray-400 font-mono">{t.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{t.customerName}</div>
                    <div className="text-xs text-gray-400">{t.sale}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{t.bank}</div>
                    <div className="text-xs font-semibold text-gray-500">{t.cardType} (****{t.lastFourDigits})</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-blue-600">{formatCurrency(t.amount)}</div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-bold ${
                      t.type === 'Rút' ? 'bg-orange-100 text-orange-600' : 
                      t.type === 'Đáo' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {t.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-gray-400">{t.customerFeePercent}%</div>
                    <div className="text-sm font-bold text-gray-700">{formatCurrency(t.customerCharge)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-green-600">{formatCurrency(t.profit)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      t.status === TransactionStatus.PAID 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                      )}
                      {user.role === 'ADMIN' && (
                        <button onClick={() => initiateDelete(t.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards Layout */}
      <div className="md:hidden space-y-4">
        {currentItems.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden transition-transform active:scale-[0.98]">
            {/* Hàng đầu tiên: Ngày và Sale (Người làm) */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-tighter">{t.timestamp}</span>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100">SALE: {t.sale}</span>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                t.status === TransactionStatus.PAID ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {t.status === TransactionStatus.PAID ? 'Đã thu' : 'Chờ thu'}
              </span>
            </div>

            {/* Hàng thứ hai: Tên khách hàng và ID */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 font-mono mb-0.5">#{t.id}</div>
              <h4 className="text-xl font-black text-gray-900 leading-tight">{t.customerName}</h4>
              <div className="text-xs text-gray-500 font-medium">{t.bank} - {t.cardType} (****{t.lastFourDigits})</div>
            </div>

            {/* Thông số tiền bạc */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 mb-4 bg-gray-50/30 -mx-5 px-5">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Số tiền làm</p>
                <p className="text-lg font-black text-blue-600">{formatCurrency(t.amount)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Lợi nhuận</p>
                <p className="text-lg font-black text-green-600">{formatCurrency(t.profit)}</p>
              </div>
            </div>

            {/* Chân thẻ: Loại GD và Nút hành động */}
            <div className="flex justify-between items-center">
               <div className="flex gap-2">
                 <div className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-tight ${
                    t.type === 'Rút' ? 'bg-orange-100 text-orange-600' : 
                    t.type === 'Đáo' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {t.type}
                  </div>
               </div>
               <div className="flex gap-2">
                 {canEdit && (
                   <button onClick={() => handleEdit(t)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl active:bg-blue-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                 )}
                 {user.role === 'ADMIN' && (
                   <button onClick={() => initiateDelete(t.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl active:bg-red-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={handleAddClick}
        aria-label="Tạo giao dịch mới"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-40"
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-4 md:px-6 py-4 bg-gray-50/50 border-t rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">Hiện {currentItems.length}/{sortedAndFilteredTransactions.length} GD</p>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sau
            </button>
            
            <div className="flex items-center gap-1 mx-1 md:mx-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                // Responsive logic for pagination numbers
                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo(0,0); }} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {p}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa?</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">Dữ liệu xóa sẽ không thể khôi phục.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl">Hủy</button>
                <button onClick={handleConfirmDelete} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <TransactionForm 
          user={user}
          customers={customers}
          initialData={editingTransaction}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={(data) => {
            if (editingTransaction) onUpdate(data);
            else onAdd(data);
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default TransactionView;
