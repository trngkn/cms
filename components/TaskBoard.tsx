
import React, { useState, useEffect } from 'react';
import { Task, User, TaskStatus, TaskComment } from '../types';
import { generateId, getCurrentDate } from '../utils';

interface TaskBoardProps {
  tasks: Task[];
  user: User;
  onCreateTask: (t: Task) => void;
  onUpdateTask: (t: Task) => void;
  onAddComment: (taskId: string, comment: TaskComment) => void;
  initialSelectedTaskId: string | null;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, user, onCreateTask, onUpdateTask, onAddComment, initialSelectedTaskId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    assignedToNames: [] as string[]
  });

  // Handle notification click auto-open
  useEffect(() => {
    if (initialSelectedTaskId) {
      const task = tasks.find(t => t.id === initialSelectedTaskId);
      if (task) {
        setSelectedTask(task);
        setIsDetailOpen(true);
      }
    }
  }, [initialSelectedTaskId, tasks]);

  const canEdit = user.role === 'ADMIN' || user.role === 'MANAGER';
  
  // Demo users list for assignment
  const availableUsers = [
    { username: 'admin', fullName: 'Administrator' },
    { username: 'manager', fullName: 'Quản lý B' },
    { username: 'user', fullName: 'Nhân viên A' }
  ];

  const toggleAssignee = (u: {username: string, fullName: string}) => {
    setTaskForm(prev => {
      const isAssigned = prev.assignedTo.includes(u.username);
      if (isAssigned) {
        return {
          ...prev,
          assignedTo: prev.assignedTo.filter(id => id !== u.username),
          assignedToNames: prev.assignedToNames.filter(name => name !== u.fullName)
        };
      } else {
        return {
          ...prev,
          assignedTo: [...prev.assignedTo, u.username],
          assignedToNames: [...prev.assignedToNames, u.fullName]
        };
      }
    });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const updated = {
        ...editingTask,
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: taskForm.assignedTo,
        assignedToNames: taskForm.assignedToNames
      };
      onUpdateTask(updated);
    } else {
      const task: Task = {
        id: generateId(),
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: taskForm.assignedTo.length > 0 ? taskForm.assignedTo : ['user'],
        assignedToNames: taskForm.assignedToNames.length > 0 ? taskForm.assignedToNames : ['Nhân viên A'],
        createdBy: user.username,
        createdByName: user.fullName,
        createdAt: getCurrentDate(),
        status: 'TODO',
        comments: []
      };
      onCreateTask(task);
    }
    closeForm();
  };

  const openEditForm = (t: Task) => {
    setEditingTask(t);
    setTaskForm({
      title: t.title,
      description: t.description,
      assignedTo: t.assignedTo,
      assignedToNames: t.assignedToNames
    });
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', assignedTo: [], assignedToNames: [] });
  };

  const updateStatus = (t: Task, s: TaskStatus) => {
    onUpdateTask({ ...t, status: s });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    
    const comment: TaskComment = {
      id: generateId(),
      author: user.username,
      authorName: user.fullName,
      text: commentText,
      timestamp: getCurrentDate() + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    };
    
    onAddComment(selectedTask.id, comment);
    setCommentText('');
    
    // Refresh local selected task to show new comment
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask({...updated, comments: [...updated.comments, comment]});
  };

  const columns: { status: TaskStatus, title: string, color: string }[] = [
    { status: 'TODO', title: 'Chờ xử lý', color: 'bg-slate-400' },
    { status: 'IN_PROGRESS', title: 'Đang làm', color: 'bg-blue-500' },
    { status: 'DONE', title: 'Hoàn thành', color: 'bg-green-500' },
  ];

  const myTasks = user.role === 'USER' 
    ? tasks.filter(t => t.assignedTo.includes(user.username)) 
    : tasks;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bảng Quản trị Công việc</h2>
          <p className="text-gray-400">Giao việc và theo dõi tiến độ thời gian thực</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Tạo công việc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map(col => (
          <div key={col.status} className="bg-gray-100/30 rounded-[2.5rem] p-6 border border-gray-100 min-h-[500px]">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${col.color}`}></span>
                <h3 className="font-black text-gray-500 uppercase text-xs tracking-widest">{col.title}</h3>
              </div>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-black text-gray-400 border border-gray-100">
                {myTasks.filter(t => t.status === col.status).length}
              </span>
            </div>

            <div className="space-y-4">
              {myTasks.filter(t => t.status === col.status).map(t => (
                <div 
                  key={t.id} 
                  onClick={() => { setSelectedTask(t); setIsDetailOpen(true); }}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 line-clamp-2">{t.title}</h4>
                    {canEdit && (
                       <button onClick={(e) => { e.stopPropagation(); openEditForm(t); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{t.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2 overflow-hidden">
                      {t.assignedToNames.slice(0, 3).map((name, i) => (
                        <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase" title={name}>
                          {name.charAt(0)}
                        </div>
                      ))}
                      {t.assignedToNames.length > 3 && (
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          +{t.assignedToNames.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {t.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {t.comments.length}
                        </div>
                      )}
                      <span className="text-[10px] font-medium text-slate-300">{t.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail & Comments Modal */}
      {isDetailOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] animate-in zoom-in duration-200">
             {/* Left side: Detail */}
             <div className="flex-1 p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    selectedTask.status === 'TODO' ? 'bg-slate-100 text-slate-500' : 
                    selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {columns.find(c => c.status === selectedTask.status)?.title}
                  </span>
                  <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-4">{selectedTask.title}</h3>
                <div className="bg-slate-50 p-6 rounded-3xl mb-8">
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{selectedTask.description || 'Không có mô tả chi tiết.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Người thực hiện</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.assignedToNames.map((name, i) => (
                          <span key={i} className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-lg border border-blue-100">{name}</span>
                        ))}
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thông tin</label>
                      <p className="text-xs text-slate-500">Người giao: <span className="font-bold text-slate-700">{selectedTask.createdByName || selectedTask.createdBy}</span></p>
                      <p className="text-xs text-slate-500">Ngày tạo: <span className="font-bold text-slate-700">{selectedTask.createdAt}</span></p>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cập nhật tiến độ</label>
                   <div className="flex gap-2">
                      {columns.map(col => (
                        <button 
                          key={col.status}
                          onClick={() => updateStatus(selectedTask, col.status)}
                          className={`flex-1 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                            selectedTask.status === col.status 
                              ? `${col.status === 'TODO' ? 'border-slate-400 bg-slate-50 text-slate-600' : col.status === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-green-500 bg-green-50 text-green-700'}`
                              : 'border-gray-100 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {col.title}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             {/* Right side: Comments */}
             <div className="w-full md:w-96 flex flex-col bg-slate-50/50">
                <div className="p-6 border-b border-gray-100 bg-white">
                  <h4 className="font-black text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Trao đổi ({selectedTask.comments.length})
                  </h4>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {selectedTask.comments.map(comment => (
                    <div key={comment.id} className={`flex flex-col ${comment.author === user.username ? 'items-end' : 'items-start'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400">{comment.authorName}</span>
                          <span className="text-[9px] text-slate-300">{comment.timestamp}</span>
                       </div>
                       <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm shadow-sm ${
                         comment.author === user.username ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-gray-100 rounded-tl-none'
                       }`}>
                          {comment.text}
                       </div>
                    </div>
                  ))}
                  {selectedTask.comments.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                       <p className="text-xs italic">Chưa có bình luận nào</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100">
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Viết phản hồi..."
                      className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button 
                      type="submit"
                      disabled={!commentText.trim()}
                      className="bg-blue-600 text-white p-2 rounded-xl disabled:bg-slate-300 shadow-md shadow-blue-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Creation/Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <form onSubmit={handleSaveTask} className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
               <h3 className="text-xl font-bold">{editingTask ? 'Cập nhật công việc' : 'Giao việc mới'}</h3>
               <button type="button" onClick={closeForm} className="text-gray-400 p-2 hover:bg-gray-100 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tiêu đề công việc</label>
                  <input required placeholder="VD: Kiểm tra hồ sơ khách A..." value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
                  <textarea rows={4} placeholder="Nhập yêu cầu chi tiết của công việc..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600 leading-relaxed" />
               </div>
               
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Người thực hiện (Chọn một hoặc nhiều)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableUsers.map(u => (
                      <button 
                        key={u.username}
                        type="button"
                        onClick={() => toggleAssignee(u)}
                        className={`flex items-center justify-between px-5 py-3 rounded-2xl border-2 transition-all ${
                          taskForm.assignedTo.includes(u.username) 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                            : 'border-slate-50 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${taskForm.assignedTo.includes(u.username) ? 'bg-blue-600' : 'bg-slate-300'}`}>
                             {u.fullName.charAt(0)}
                          </div>
                          <span>{u.fullName} (@{u.username})</span>
                        </div>
                        {taskForm.assignedTo.includes(u.username) && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
               <button type="button" onClick={closeForm} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-200 rounded-2xl transition-all">Bỏ qua</button>
               <button type="submit" className="flex-1 py-4 font-bold bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:-translate-y-1">{editingTask ? 'Cập nhật' : 'Giao việc ngay'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
