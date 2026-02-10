import { useState, useMemo, useEffect } from 'react';
import { TopNavbar } from '@/app/components/top-navbar';
import { Sidebar } from '@/app/components/sidebar';
import { TaskKanban } from '@/app/components/task-kanban';
import { TaskTable } from '@/app/components/task-table';
import { TaskModal } from '@/app/components/task-modal';
import { ProfileModal } from '@/app/components/profile-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Checkbox } from '@/app/components/ui/checkbox';
import type { Task, User, TaskStatus } from '@/app/data/mock-data';

type FilterType = 'all' | 'my-tasks' | TaskStatus;

interface DashboardProps {
  currentUser: User;
  users: User[];
  initialTasks: Task[];
}

export function Dashboard({ currentUser, users, initialTasks }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('my-tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  // Mobile status filters - multi-select (applied filters)
  const [mobileStatusFilters, setMobileStatusFilters] = useState<TaskStatus[]>([]);
  
  // Temporary filter state (for popover)
  const [tempStatusFilters, setTempStatusFilters] = useState<TaskStatus[]>([]);
  
  // Popover open state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Update view mode when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTasks = useMemo(() => {
    // Staff can only see their own tasks
    let filtered = tasks.filter((task) => task.assignedTo === currentUser.id);

    // Desktop sidebar filter
    if (isDesktop && currentFilter !== 'all' && currentFilter !== 'my-tasks') {
      filtered = filtered.filter((task) => task.status === currentFilter);
    }
    
    // Mobile multi-select status filter
    if (!isDesktop && mobileStatusFilters.length > 0) {
      filtered = filtered.filter((task) => mobileStatusFilters.includes(task.status));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.propertyId?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tasks, currentUser, currentFilter, searchQuery, isDesktop, mobileStatusFilters]);

  const taskCounts = useMemo(() => {
    const userTasks = tasks.filter((t) => t.assignedTo === currentUser.id);
    
    return {
      all: userTasks.length,
      myTasks: userTasks.length,
      pending: userTasks.filter((t) => t.status === 'Pending').length,
      inProgress: userTasks.filter((t) => t.status === 'In Progress').length,
      completed: userTasks.filter((t) => t.status === 'Completed').length,
    };
  }, [tasks, currentUser]);

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t))
      );
    } else {
      // Create new task
      const newTask: Task = {
        id: String(Date.now()),
        title: taskData.title || '',
        description: taskData.description || '',
        assignedTo: taskData.assignedTo || '',
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'Pending',
        dueDate: taskData.dueDate || '',
        createdBy: taskData.createdBy || currentUser.id,
        propertyId: taskData.propertyId,
        createdAt: taskData.createdAt || new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setEditingTask(undefined);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleStatusFilterToggle = (status: TaskStatus) => {
    setTempStatusFilters((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const applyMobileFilters = () => {
    setMobileStatusFilters(tempStatusFilters);
    setIsFilterOpen(false);
  };

  const cancelMobileFilters = () => {
    setTempStatusFilters(mobileStatusFilters);
    setIsFilterOpen(false);
  };

  const handleFilterOpen = (open: boolean) => {
    if (open) {
      // Sync temp filters with current filters when opening
      setTempStatusFilters(mobileStatusFilters);
    }
    setIsFilterOpen(open);
  };

  const removeStatusFilter = (status: TaskStatus) => {
    setMobileStatusFilters((prev) => prev.filter((s) => s !== status));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNavbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="flex">
        {/* Desktop Sidebar - only visible on large screens */}
        {isDesktop && (
          <Sidebar
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            userRole={currentUser.role}
            taskCounts={taskCounts}
          />
        )}

        <main className="flex-1 p-3 md:p-6">
          {/* Mobile Header with Filter - only visible on mobile */}
          {!isDesktop && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold mb-1">My Tasks</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                
                {/* Filter Popover */}
                <Popover open={isFilterOpen} onOpenChange={handleFilterOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                      <span>Filter</span>
                      {mobileStatusFilters.length > 0 && mobileStatusFilters.length < 3 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {mobileStatusFilters.length}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Task Status</h3>
                      <div className="space-y-2">                     
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={tempStatusFilters.includes('Pending')}
                            onCheckedChange={() => handleStatusFilterToggle('Pending')}
                          />
                          <span className="text-sm">Pending ({taskCounts.pending})</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={tempStatusFilters.includes('In Progress')}
                            onCheckedChange={() => handleStatusFilterToggle('In Progress')}
                          />
                          <span className="text-sm">In Progress ({taskCounts.inProgress})</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={tempStatusFilters.includes('Completed')}
                            onCheckedChange={() => handleStatusFilterToggle('Completed')}
                          />
                          <span className="text-sm">Completed ({taskCounts.completed})</span>
                        </label>
                      </div>
                      <div className="flex justify-between">
                        <button
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                          onClick={cancelMobileFilters}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                          onClick={applyMobileFilters}
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Active Filter Chips */}
              {mobileStatusFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {mobileStatusFilters.map((status) => (
                    <div
                      key={status}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
                    >
                      <span>{status}</span>
                      <button
                        onClick={() => removeStatusFilter(status)}
                        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${status} filter`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Desktop heading */}
          {isDesktop && (
            <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold mb-1">
                  {currentFilter === 'all' && 'My Tasks'}
                  {currentFilter === 'my-tasks' && 'My Tasks'}
                  {currentFilter === 'Pending' && 'Pending Tasks'}
                  {currentFilter === 'In Progress' && 'In Progress Tasks'}
                  {currentFilter === 'Completed' && 'Completed Tasks'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
          )}

          {/* Mobile: Show Board View only */}
          {!isDesktop && (
            <TaskKanban
              tasks={filteredTasks}
              users={users}
              currentUserRole={currentUser.role}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
              isMobileListView={true}
            />
          )}

          {/* Desktop: Show Table View only */}
          {isDesktop && (
            <TaskTable
              tasks={filteredTasks}
              users={users}
              currentUserRole={currentUser.role}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        users={users}
        currentUserId={currentUser.id}
        isStaffView={currentUser.role === 'Staff'}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
      />
    </div>
  );
}