import { useState, useMemo, useEffect } from 'react';
import { TopNavbar } from '@/app/components/topNavbar';
import { Sidebar } from '@/app/components/sidebar';
import { TaskKanban } from '@/app/components/taskKanban';
import { TaskTable } from '@/app/components/taskTable';
import { TaskModal } from '@/app/components/taskModal';
import { ProfileModal } from '@/app/components/profileModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Input } from '@/app/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Task, User, TaskStatus, Priority } from '@/app/data/mock-data';

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
  const [mobilePriorityFilters, setMobilePriorityFilters] = useState<Priority[]>([]);
  const [mobileDueDateFilter, setMobileDueDateFilter] = useState<string>(''); // 'overdue', 'today', 'week', ''
  
  // Desktop filters
  const [desktopPriorityFilter, setDesktopPriorityFilter] = useState<Priority | 'all'>('all');
  const [desktopDueDateFilter, setDesktopDueDateFilter] = useState<string>('all'); // 'overdue', 'today', 'week', 'all'
  
  // Temporary filter state (for popover)
  const [tempStatusFilters, setTempStatusFilters] = useState<TaskStatus[]>([]);
  const [tempPriorityFilters, setTempPriorityFilters] = useState<Priority[]>([]);
  const [tempDueDateFilter, setTempDueDateFilter] = useState<string>('');
  
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

    // Mobile priority filter
    if (!isDesktop && mobilePriorityFilters.length > 0) {
      filtered = filtered.filter((task) => mobilePriorityFilters.includes(task.priority));
    }

    // Mobile due date filter
    if (!isDesktop && mobileDueDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        if (mobileDueDateFilter === 'overdue') {
          return taskDate < today && task.status !== 'Completed';
        } else if (mobileDueDateFilter === 'today') {
          return taskDate.getTime() === today.getTime();
        } else if (mobileDueDateFilter === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          return taskDate >= today && taskDate <= weekFromNow;
        }
        return true;
      });
    }

    // Desktop priority filter
    if (isDesktop && desktopPriorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === desktopPriorityFilter);
    }

    // Desktop due date filter
    if (isDesktop && desktopDueDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        if (desktopDueDateFilter === 'overdue') {
          return taskDate < today && task.status !== 'Completed';
        } else if (desktopDueDateFilter === 'today') {
          return taskDate.getTime() === today.getTime();
        } else if (desktopDueDateFilter === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          return taskDate >= today && taskDate <= weekFromNow;
        }
        return true;
      });
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
  }, [tasks, currentUser, currentFilter, searchQuery, isDesktop, mobileStatusFilters, mobilePriorityFilters, mobileDueDateFilter, desktopPriorityFilter, desktopDueDateFilter]);

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

  const handlePriorityFilterToggle = (priority: Priority) => {
    setTempPriorityFilters((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((p) => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };

  const applyMobileFilters = () => {
    setMobileStatusFilters(tempStatusFilters);
    setMobilePriorityFilters(tempPriorityFilters);
    setMobileDueDateFilter(tempDueDateFilter);
    setIsFilterOpen(false);
  };

  const cancelMobileFilters = () => {
    setTempStatusFilters(mobileStatusFilters);
    setTempPriorityFilters(mobilePriorityFilters);
    setTempDueDateFilter(mobileDueDateFilter);
    setIsFilterOpen(false);
  };

  const handleFilterOpen = (open: boolean) => {
    if (open) {
      // Sync temp filters with current filters when opening
      setTempStatusFilters(mobileStatusFilters);
      setTempPriorityFilters(mobilePriorityFilters);
      setTempDueDateFilter(mobileDueDateFilter);
    }
    setIsFilterOpen(open);
  };

  const removeStatusFilter = (status: TaskStatus) => {
    setMobileStatusFilters((prev) => prev.filter((s) => s !== status));
  };

  const removePriorityFilter = (priority: Priority) => {
    setMobilePriorityFilters((prev) => prev.filter((p) => p !== priority));
  };

  const removeDueDateFilter = () => {
    setMobileDueDateFilter('');
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
                      {(mobileStatusFilters.length > 0 || mobilePriorityFilters.length > 0 || mobileDueDateFilter) && (
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {mobileStatusFilters.length + mobilePriorityFilters.length + (mobileDueDateFilter ? 1 : 0)}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm mb-3 pb-2 border-b text-gray-900 uppercase tracking-wide">Task Status</h3>
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
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-3 pb-2 border-b text-gray-900 uppercase tracking-wide">Priority</h3>
                        <div className="space-y-2">                     
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempPriorityFilters.includes('Low')}
                              onCheckedChange={() => handlePriorityFilterToggle('Low')}
                            />
                            <span className="text-sm">Low</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempPriorityFilters.includes('Medium')}
                              onCheckedChange={() => handlePriorityFilterToggle('Medium')}
                            />
                            <span className="text-sm">Medium</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempPriorityFilters.includes('High')}
                              onCheckedChange={() => handlePriorityFilterToggle('High')}
                            />
                            <span className="text-sm">High</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-3 pb-2 border-b text-gray-900 uppercase tracking-wide">Due Date</h3>
                        <div className="space-y-2">                     
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempDueDateFilter === 'overdue'}
                              onCheckedChange={() => setTempDueDateFilter(tempDueDateFilter === 'overdue' ? '' : 'overdue')}
                            />
                            <span className="text-sm">Overdue</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempDueDateFilter === 'today'}
                              onCheckedChange={() => setTempDueDateFilter(tempDueDateFilter === 'today' ? '' : 'today')}
                            />
                            <span className="text-sm">Today</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={tempDueDateFilter === 'week'}
                              onCheckedChange={() => setTempDueDateFilter(tempDueDateFilter === 'week' ? '' : 'week')}
                            />
                            <span className="text-sm">Next 7 Days</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
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
              {mobilePriorityFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {mobilePriorityFilters.map((priority) => (
                    <div
                      key={priority}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
                    >
                      <span>{priority}</span>
                      <button
                        onClick={() => removePriorityFilter(priority)}
                        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${priority} filter`}
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
              {mobileDueDateFilter && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
                  >
                    <span>{mobileDueDateFilter === 'overdue' ? 'Overdue' : mobileDueDateFilter === 'today' ? 'Today' : 'Next 7 Days'}</span>
                    <button
                      onClick={removeDueDateFilter}
                      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${mobileDueDateFilter} filter`}
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
                </div>
              )}
            </div>
          )}

          {/* Desktop heading */}
          {isDesktop && (
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
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
                
                {/* Search and Filters */}
                <div className="flex items-center gap-3">
                  {/* Search Input */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search tasks..."
                      className="pl-9 h-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Priority Filter */}
                  <Select value={desktopPriorityFilter} onValueChange={(value) => setDesktopPriorityFilter(value as Priority | 'all')}>
                    <SelectTrigger className="w-32 h-10">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Due Date Filter */}
                  <Select value={desktopDueDateFilter} onValueChange={(value) => setDesktopDueDateFilter(value)}>
                    <SelectTrigger className="w-36 h-10">
                      <SelectValue placeholder="Due Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Next 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Clear Filters */}
                  {(searchQuery || desktopPriorityFilter !== 'all' || desktopDueDateFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDesktopPriorityFilter('all');
                        setDesktopDueDateFilter('all');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="size-4" />
                      Clear
                    </button>
                  )}
                </div>
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