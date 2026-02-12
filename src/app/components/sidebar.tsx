import { LayoutGrid, CheckCircle2, Clock, PlayCircle, ListTodo, X, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import type { UserRole, TaskStatus } from '@/app/data/mock-data';
import { useState } from 'react';

type FilterType = 'all' | 'my-tasks' | TaskStatus;

interface SidebarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  userRole: UserRole;
  taskCounts: {
    all: number;
    myTasks: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ currentFilter, onFilterChange, userRole, taskCounts, isMobileOpen, onMobileClose }: SidebarProps) {
  const [isMyTasksExpanded, setIsMyTasksExpanded] = useState(true);

  const subMenuItems = [
    { id: 'Pending' as FilterType, label: 'Pending', icon: Clock, count: taskCounts.pending },
    { id: 'In Progress' as FilterType, label: 'In Progress', icon: PlayCircle, count: taskCounts.inProgress },
    { id: 'Completed' as FilterType, label: 'Completed', icon: CheckCircle2, count: taskCounts.completed },
  ];

  const handleFilterChange = (filter: FilterType) => {
    onFilterChange(filter);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'w-60 border-r z-50 transition-transform duration-300',
        'md:sticky md:top-14 md:h-[calc(100vh-3.5rem)]',
        'lg:top-[72px] lg:h-[calc(100vh-72px)]',
        'fixed top-14 bottom-0 left-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      style={{ backgroundColor: '#f5f7fa' }}
      >
        {/* Mobile close button header */}
        <div className="flex items-center justify-end px-4 py-3 border-b bg-white/50 md:hidden">
          <Button variant="ghost" size="sm" onClick={onMobileClose}>
            <X className="size-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {/* My Tasks - Parent Item */}
          <div>
            <button
              onClick={() => {
                setIsMyTasksExpanded(!isMyTasksExpanded);
                handleFilterChange('my-tasks');
              }}
              className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                currentFilter === 'my-tasks'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                {isMyTasksExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                <ListTodo className="size-4" />
                <span>My Tasks</span>
              </div>
              {taskCounts.myTasks > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    currentFilter === 'my-tasks' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                  )}
                >
                  {taskCounts.myTasks}
                </span>
              )}
            </button>

            {/* Sub-menu Items */}
            {isMyTasksExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {subMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentFilter === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleFilterChange(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count > 0 && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs',
                            isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}