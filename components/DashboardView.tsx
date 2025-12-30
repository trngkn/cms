
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Transaction, User } from '../types';
import { formatCurrency } from '../utils';

// Moved StatCard definition to the top to avoid potential hoisting issues
const StatCard = ({ label, value, unit, color }: { label: string, value: string, unit: string, color: 'blue' | 'green' | 'purple' | 'red' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50'
  };
  return (
    <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-xl md:text-2xl font-black ${color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
      <div className={`mt-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase w-fit ${colors[color]}`}>{unit}</div>
    </div>
  );
};

// Moved ChartCard definition to the top and used explicit React.FC to fix children prop recognition errors (Line 119 and 140)
const ChartCard: React.FC<{ title: string, subtitle: string, children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <div className="mb-8">
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
    </div>
    <div className="h-64 md:h-80">{children}</div>
  </div>
);

interface DashboardViewProps {
  transactions: Transaction[];
  user: User;
  onViewUserDetail: (saleName: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ transactions, user, onViewUserDetail }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const baseTransactions = useMemo(() => {
    return user.role === 'ADMIN' 
      ? transactions 
      : transactions.filter(t => t.sale === user.fullName);
  }, [transactions, user]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    baseTransactions.forEach(t => {
      const [_, m, y] = t.timestamp.split('/');
      months.add(`${m}/${y}`);
    });
    return Array.from(months).sort((a, b) => {
      const [m1, y1] = a.split('/').map(Number);
      const [m2, y2] = b.split('/').map(Number);
      return y1 !== y2 ? y2 - y1 : m2 - m1;
    });
  }, [baseTransactions]);

  const userTransactions = useMemo(() => {
    if (selectedMonth === 'all') return baseTransactions;
    return baseTransactions.filter(t => {
      const [_, m, y] = t.timestamp.split('/');
      return `${m}/${y}` === selectedMonth;
    });
  }, [baseTransactions, selectedMonth]);

  const stats = useMemo(() => {
    const totalAmount = userTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalProfit = userTransactions.reduce((acc, t) => acc + t.profit, 0);
    const count = userTransactions.length;
    const unpaidCount = userTransactions.filter(t => t.status === 'Chưa thanh toán').length;
    return { totalAmount, totalProfit, count, unpaidCount };
  }, [userTransactions]);

  const chartData = useMemo(() => {
    if (selectedMonth === 'all') {
      const months: Record<string, { name: string, amount: number, profit: number }> = {};
      baseTransactions.forEach(t => {
        const [_, m, y] = t.timestamp.split('/');
        const key = `${m}/${y}`;
        if (!months[key]) months[key] = { name: key, amount: 0, profit: 0 };
        months[key].amount += t.amount;
        months[key].profit += t.profit;
      });
      return Object.values(months).sort((a, b) => {
        const [m1, y1] = a.name.split('/').map(Number);
        const [m2, y2] = b.name.split('/').map(Number);
        return y1 !== y2 ? y1 - y2 : m1 - m2;
      });
    } else {
      const days: Record<string, { name: string, amount: number, profit: number, fullDate: string }> = {};
      userTransactions.forEach(t => {
        const [d, m, y] = t.timestamp.split('/');
        const dayKey = d;
        if (!days[dayKey]) days[dayKey] = { name: `${d}`, amount: 0, profit: 0, fullDate: t.timestamp };
        days[dayKey].amount += t.amount;
        days[dayKey].profit += t.profit;
      });
      return Object.values(days).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    }
  }, [baseTransactions, userTransactions, selectedMonth]);

  const userSummary = useMemo(() => {
    if (user.role !== 'ADMIN') return [];
    const summary: Record<string, { sale: string, totalAmount: number, totalProfit: number, count: number }> = {};
    userTransactions.forEach(t => {
      const key = t.sale;
      if (!summary[key]) summary[key] = { sale: key, totalAmount: 0, totalProfit: 0, count: 0 };
      summary[key].totalAmount += t.amount;
      summary[key].totalProfit += t.profit;
      summary[key].count += 1;
    });
    return Object.values(summary).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [userTransactions, user]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <div>
           <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Thời gian hiển thị</h2>
           <p className="text-lg font-bold text-slate-800">Thống kê hiệu quả kinh doanh</p>
        </div>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Tất cả thời gian</option>
          {availableMonths.map(m => (
            <option key={m} value={m}>Tháng {m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Tổng Số Tiền Làm" value={formatCurrency(stats.totalAmount)} unit="VND" color="blue" />
        <StatCard label="Lợi Nhuận Gộp" value={formatCurrency(stats.totalProfit)} unit="Thực thu" color="green" />
        <StatCard label="Tổng Giao Dịch" value={stats.count.toString()} unit="Lượt GD" color="purple" />
        <StatCard label="Chưa Thanh Toán" value={stats.unpaidCount.toString()} unit="Cần xử lý" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <ChartCard title="Lợi nhuận gộp" subtitle={selectedMonth === 'all' ? 'Hàng tháng' : `Tháng ${selectedMonth}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Lợi nhuận']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Khối lượng giao dịch" subtitle={selectedMonth === 'all' ? 'Hàng tháng' : `Tháng ${selectedMonth}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Doanh số']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={selectedMonth === 'all' ? 30 : 12} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {user.role === 'ADMIN' && (
        <div className="bg-white p-4 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            Thống kê hiệu quả Nhân viên
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase">Realtime</span>
          </h3>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">Nhân viên</th>
                  <th className="px-6 py-4">Giao dịch</th>
                  <th className="px-6 py-4">Doanh số</th>
                  <th className="px-6 py-4">Lợi nhuận</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userSummary.map((s) => (
                  <tr key={s.sale} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{s.sale}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{s.count}</td>
                    <td className="px-6 py-4 text-blue-600 font-black">{formatCurrency(s.totalAmount)}</td>
                    <td className="px-6 py-4 text-green-600 font-black">{formatCurrency(s.totalProfit)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onViewUserDetail(s.sale)} className="text-blue-600 font-bold text-xs bg-blue-50 px-4 py-2 rounded-xl">Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile User Summary Cards */}
          <div className="md:hidden space-y-4">
             {userSummary.map((s) => (
                <div key={s.sale} className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-slate-800">{s.sale}</h4>
                      <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 border">{s.count} GD</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Doanh số</p>
                        <p className="text-sm font-bold text-blue-600">{formatCurrency(s.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Lợi nhuận</p>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(s.totalProfit)}</p>
                      </div>
                   </div>
                   <button onClick={() => onViewUserDetail(s.sale)} className="w-full py-3 bg-white text-blue-600 font-bold text-xs rounded-2xl border border-blue-100">Xem chi tiết giao dịch</button>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
