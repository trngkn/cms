
import React, { useState, useEffect } from 'react';
import { User, Transaction, Customer, Task, Notification, TaskComment } from './types';
import { MOCK_TRANSACTIONS } from './constants';
import { generateId, getCurrentDate, DEFAULT_AVATAR } from './utils';
import AuthPage from './components/AuthPage';
import DashboardView from './components/DashboardView';
import TransactionView from './components/TransactionView';
import CustomerView from './components/CustomerView';
import TaskBoard from './components/TaskBoard';
import UserManagementView from './components/UserManagementView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'crm' | 'tasks' | 'users' | 'settings' | 'profile'>('dashboard');
  
  // Site Config
  const [siteName, setSiteName] = useState<string>('CardMaster');
  const [siteLogo, setSiteLogo] = useState<string>('');

  // Data states
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', fullName: 'Administrator', role: 'ADMIN', avatar: DEFAULT_AVATAR, password: 'admin' },
    { id: '2', username: 'user', fullName: 'Nhân viên A', role: 'USER', avatar: DEFAULT_AVATAR, password: 'user' },
    { id: '3', username: 'manager', fullName: 'Quản lý B', role: 'MANAGER', avatar: DEFAULT_AVATAR, password: 'manager' }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedT = localStorage.getItem('cm_transactions');
    if (savedT) setTransactions(JSON.parse(savedT));
    const savedC = localStorage.getItem('cm_customers');
    if (savedC) setCustomers(JSON.parse(savedC));
    const savedTasks = localStorage.getItem('cm_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    const savedNotifs = localStorage.getItem('cm_notifications');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    const savedUsers = localStorage.getItem('cm_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    const savedSiteName = localStorage.getItem('cm_sitename');
    if (savedSiteName) setSiteName(savedSiteName);
    const savedSiteLogo = localStorage.getItem('cm_sitelogo');
    if (savedSiteLogo) setSiteLogo(savedSiteLogo);
  }, []);

  useEffect(() => {
    localStorage.setItem('cm_transactions', JSON.stringify(transactions));
    localStorage.setItem('cm_customers', JSON.stringify(customers));
    localStorage.setItem('cm_tasks', JSON.stringify(tasks));
    localStorage.setItem('cm_notifications', JSON.stringify(notifications));
    localStorage.setItem('cm_users', JSON.stringify(users));
    localStorage.setItem('cm_sitename', siteName);
    localStorage.setItem('cm_sitelogo', siteLogo);
    document.title = `${siteName} - Management System`;
  }, [transactions, customers, tasks, notifications, users, siteName, siteLogo]);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    setFilterUser(null);
    setSelectedTaskId(null);
  };

  const handleUpdateSite = (name: string, logo: string) => {
    setSiteName(name);
    setSiteLogo(logo);
  };

  const handleUpdateProfile = (updated: User) => {
    setUsers(users.map(u => u.id === updated.id ? updated : u));
    setUser(updated);
  };

  const handleAddUser = (u: User) => {
    setUsers([...users, u]);
  };

  const handleUpdateUser = (u: User) => {
    setUsers(users.map(item => item.id === u.id ? u : item));
    if (user && user.id === u.id) setUser(u);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const syncCRM = (t: Transaction) => {
    setCustomers(prev => {
      const exists = prev.find(c => 
        c.name.toLowerCase() === t.customerName.toLowerCase() &&
        c.bank.toLowerCase() === t.bank.toLowerCase() &&
        c.cardType.toLowerCase() === t.cardType.toLowerCase() &&
        c.lastFourDigits === t.lastFourDigits
      );
      if (!exists) {
        return [{
          id: generateId(),
          name: t.customerName,
          bank: t.bank,
          cardType: t.cardType,
          lastFourDigits: t.lastFourDigits,
          isHoldingCard: false,
          idCardImages: [],
          cardImages: []
        }, ...prev];
      }
      return prev;
    });
  };

  const addTransaction = (t: Transaction) => {
    setTransactions([t, ...transactions]);
    syncCRM(t);
  };

  const updateTransaction = (t: Transaction) => {
    setTransactions(transactions.map(item => item.id === t.id ? t : item));
    syncCRM(t);
  };

  const deleteTransaction = (id: string) => {
    if (user?.role === 'USER') return;
    setTransactions(transactions.filter(item => item.id !== id));
  };

  const handleAddCustomer = (c: Customer) => setCustomers([c, ...customers]);
  const handleUpdateCustomer = (c: Customer) => setCustomers(customers.map(item => item.id === c.id ? c : item));
  const handleDeleteCustomer = (id: string) => user?.role === 'ADMIN' && setCustomers(customers.filter(c => c.id !== id));

  const notifyUsers = (message: string, taskId: string, assignees: string[]) => {
    const newNotifs = assignees.map(username => ({
      id: generateId(),
      message,
      timestamp: getCurrentDate(),
      read: false,
      taskId,
      targetUser: username
    }));
    setNotifications(prev => [...newNotifs, ...prev]);
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    notifyUsers(`Bạn được giao công việc mới: ${newTask.title}`, newTask.id, newTask.assignedTo);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (oldTask && oldTask.status !== updatedTask.status) {
      const notif: Notification = { id: generateId(), message: `Công việc "${updatedTask.title}" đã chuyển sang: ${updatedTask.status}`, timestamp: getCurrentDate(), read: false, taskId: updatedTask.id };
      setNotifications(prev => [notif, ...prev]);
    } else {
      notifyUsers(`Công việc "${updatedTask.title}" có cập nhật mới.`, updatedTask.id, updatedTask.assignedTo);
    }
  };

  const handleAddTaskComment = (taskId: string, comment: TaskComment) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, comments: [...task.comments, comment] };
    handleUpdateTask(updatedTask);
    const others = task.assignedTo.filter(u => u !== comment.author);
    if (task.createdBy !== comment.author) others.push(task.createdBy);
    notifyUsers(`${comment.authorName} đã bình luận trong "${task.title}"`, taskId, Array.from(new Set(others)));
  };

  const handleNotifClick = (notif: Notification) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.taskId) {
      setSelectedTaskId(notif.taskId);
      setActiveTab('tasks');
    }
  };

  if (!user) return <AuthPage onLogin={handleLogin} users={users} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        siteName={siteName}
        siteLogo={siteLogo}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        notifCount={notifications.filter(n => !n.read && (n.targetUser === user.username || !n.targetUser)).length}
      />
      
      <main className="flex-1 overflow-x-hidden pt-24 md:pt-0">
        <header className="hidden md:flex bg-white border-b px-8 py-4 justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
              {activeTab === 'dashboard' ? 'Tổng quan Dashboard' : 
               activeTab === 'transactions' ? 'Quản lý Giao dịch' : 
               activeTab === 'crm' ? 'CRM Khách hàng' : 
               activeTab === 'users' ? 'Quản lý Người dùng' :
               activeTab === 'settings' ? 'Cài đặt hệ thống' :
               activeTab === 'profile' ? 'Hồ sơ cá nhân' : 'Quản lý Công việc'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="relative group">
                <div className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {notifications.some(n => !n.read && (n.targetUser === user.username || !n.targetUser)) && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <div className="p-4 border-b font-bold text-sm text-gray-700 bg-gray-50 flex justify-between">Thông báo</div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.filter(n => n.targetUser === user.username || !n.targetUser).length > 0 ? notifications.filter(n => n.targetUser === user.username || !n.targetUser).slice(0, 8).map(n => (
                      <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 border-b last:border-none cursor-pointer hover:bg-blue-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                        <p className={`text-sm ${!n.read ? 'font-bold' : 'text-gray-600'}`}>{n.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{n.timestamp}</span>
                      </div>
                    )) : <div className="p-8 text-center text-gray-400 text-sm">Không có thông báo</div>}
                  </div>
                </div>
             </div>

            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{user.fullName}</p>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-center ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {user.role}
                </div>
              </div>
              <img src={user.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-500 transition-all" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {activeTab === 'dashboard' && <DashboardView transactions={transactions} user={user} onViewUserDetail={(sale) => { setFilterUser(sale); setActiveTab('transactions'); }} />}
          {activeTab === 'transactions' && <TransactionView transactions={transactions} customers={customers} user={user} initialSearch={filterUser || ''} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} />}
          {activeTab === 'crm' && <CustomerView customers={customers} user={user} onAdd={handleAddCustomer} onUpdate={handleUpdateCustomer} onDelete={handleDeleteCustomer} />}
          {activeTab === 'tasks' && <TaskBoard tasks={tasks} user={user} onCreateTask={handleCreateTask} onUpdateTask={handleUpdateTask} onAddComment={handleAddTaskComment} initialSelectedTaskId={selectedTaskId} />}
          {activeTab === 'users' && <UserManagementView users={users} currentUser={user} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />}
          {activeTab === 'settings' && <SettingsView siteName={siteName} siteLogo={siteLogo} onUpdate={handleUpdateSite} />}
          {activeTab === 'profile' && <ProfileView user={user} onUpdate={handleUpdateProfile} />}
        </div>
      </main>
    </div>
  );
};

export default App;
