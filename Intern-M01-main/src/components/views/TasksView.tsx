import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Clock, User, AlertCircle, 
  CheckCircle2, ChevronRight, MessageSquare, Calendar, Filter 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const TasksView: React.FC = () => {
  const { tasks, interns, currentUser, mentors, addTask, updateTask, updateTaskStatus, deleteTask, hasPermission } = useApp();

  const [selectedInternFilter, setSelectedInternFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToInternId: interns[0]?.id || '',
    priority: 'medium' as TaskPriority,
    dueDate: '2026-07-25',
    progressPercent: 0
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (currentUser.role === 'intern' && currentUser.internProfileId) {
      return task.assignedToInternId === currentUser.internProfileId;
    }
    if (selectedInternFilter !== 'all') {
      return task.assignedToInternId === selectedInternFilter;
    }
    return true;
  });

  const columns: { id: TaskStatus; title: string; color: string; badgeVariant: 'neutral' | 'primary' | 'warning' | 'success' }[] = [
    { id: 'todo', title: 'Cần làm (To Do)', color: 'border-slate-300', badgeVariant: 'neutral' },
    { id: 'in_progress', title: 'Đang thực hiện', color: 'border-blue-400', badgeVariant: 'primary' },
    { id: 'review', title: 'Chờ nghiệm thu', color: 'border-amber-400', badgeVariant: 'warning' },
    { id: 'done', title: 'Hoàn thành', color: 'border-emerald-400', badgeVariant: 'success' }
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedIntern = interns.find(i => i.id === formData.assignedToInternId);
    addTask({
      title: formData.title,
      description: formData.description,
      assignedToInternId: formData.assignedToInternId,
      createdById: currentUser.id,
      departmentId: assignedIntern?.departmentId || 'dept-1',
      status: 'todo',
      priority: formData.priority,
      dueDate: formData.dueDate,
      progressPercent: 0
    });
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      description: '',
      assignedToInternId: interns[0]?.id || '',
      priority: 'medium',
      dueDate: '2026-07-25',
      progressPercent: 0
    });
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return <Badge variant="danger" size="sm">Khẩn cấp</Badge>;
      case 'high': return <Badge variant="warning" size="sm">Ưu tiên cao</Badge>;
      case 'medium': return <Badge variant="primary" size="sm">Bình thường</Badge>;
      case 'low': return <Badge variant="neutral" size="sm">Thấp</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            Quản Lý Công Việc & Tiến Độ (Kanban Board)
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'intern'
              ? 'Danh sách các nhiệm vụ được Mentor giao. Hãy cập nhật tiến độ thường xuyên!'
              : 'Giao nhiệm vụ, đặt deadline và giám sát tiến độ thực hiện của từng thực tập sinh'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role !== 'intern' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedInternFilter}
                onChange={e => setSelectedInternFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả Thực tập sinh</option>
                {interns.map(i => (
                  <option key={i.id} value={i.id}>{i.fullName}</option>
                ))}
              </select>
            </div>
          )}

          {hasPermission('tasks:create') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Việc Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board (Story 15, 16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3 min-h-[500px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'todo' ? 'bg-slate-400' :
                    col.id === 'in_progress' ? 'bg-blue-500' :
                    col.id === 'review' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <h3 className="font-bold text-xs text-slate-800">{col.title}</h3>
                </div>
                <Badge variant={col.badgeVariant} size="sm">
                  {colTasks.length}
                </Badge>
              </div>

              {/* Task list */}
              <div className="space-y-3 grow">
                {colTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-300">
                    Không có nhiệm vụ
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignedIntern = interns.find(i => i.id === task.assignedToInternId);
                    return (
                      <div
                        key={task.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          {getPriorityBadge(task.priority)}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Progress Bar (Story 16) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Tiến độ:</span>
                            <span className="font-bold text-slate-800">{task.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                task.status === 'done' ? 'bg-emerald-500' :
                                task.status === 'review' ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Card Footer: Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            {assignedIntern ? (
                              <>
                                <img
                                  src={assignedIntern.avatar}
                                  alt={assignedIntern.fullName}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                                <span className="font-medium truncate max-w-[90px]">{assignedIntern.fullName}</span>
                              </>
                            ) : (
                              <span>Chưa gán</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate.split('-').slice(1).join('/')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: GIAO NHIỆM VỤ MỚI (Story 15) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Giao Nhiệm Vụ Mới Cho Thực Tập Sinh"
        subtitle="Mô tả công việc, đặt thời hạn hoàn thành và gán người phụ trách"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề nhiệm vụ *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Thiết kế cơ sở dữ liệu và triển khai API Authentication"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả chi tiết yêu cầu *</label>
            <textarea
              rows={3}
              required
              placeholder="Yêu cầu cụ thể, tiêu chí nghiệm thu (Definition of Done)..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giao cho Thực tập sinh *</label>
              <select
                value={formData.assignedToInternId}
                onChange={e => setFormData({ ...formData, assignedToInternId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                {interns.map(i => (
                  <option key={i.id} value={i.id}>{i.fullName} ({i.university})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mức độ ưu tiên *</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Thấp (Low)</option>
                <option value="medium">Bình thường (Medium)</option>
                <option value="high">Ưu tiên cao (High)</option>
                <option value="urgent">Khẩn cấp (Urgent)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn hoàn thành (Due Date) *</label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 p-2.5 border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Tạo Nhiệm Vụ
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CHI TIẾT & CẬP NHẬT TIẾN ĐỘ NHIỆM VỤ (Story 16) */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          subtitle={`Hạn chót: ${selectedTask.dueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {getPriorityBadge(selectedTask.priority)}
              <span className="text-xs text-slate-400 font-mono">ID: {selectedTask.id}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedTask.description}
            </div>

            {/* Quick status change buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Chuyển trạng thái công việc:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {columns.map(col => (
                  <button
                    key={col.id}
                    onClick={() => {
                      updateTaskStatus(selectedTask.id, col.id);
                      setSelectedTask({ ...selectedTask, status: col.id, progressPercent: col.id === 'done' ? 100 : col.id === 'review' ? 90 : col.id === 'in_progress' ? 50 : 0 });
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      selectedTask.status === col.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {col.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Slider (Story 16) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Cập nhật % tiến độ thực tế:</span>
                <span className="text-blue-600 font-mono text-sm">{selectedTask.progressPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedTask.progressPercent}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  updateTaskStatus(selectedTask.id, selectedTask.status, val);
                  setSelectedTask({ ...selectedTask, progressPercent: val });
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {hasPermission('tasks:delete') ? (
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa nhiệm vụ này?')) {
                      deleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Xóa nhiệm vụ
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Xong
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
