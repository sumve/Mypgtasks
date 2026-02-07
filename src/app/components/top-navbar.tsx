import { Search, Building2, Menu } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import type { User } from '@/app/data/mock-data';

interface TopNavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
}

export function TopNavbar({ currentUser, searchQuery, onSearchChange, onMenuClick }: TopNavbarProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 md:h-[72px] items-center gap-2 md:gap-4 px-3 md:px-6">
        {/* Mobile menu button */}
        {onMenuClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden p-2" 
            onClick={onMenuClick}
          >
            <Menu className="size-5" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Building2 className="size-5 md:size-6 text-blue-600" />
          <span className="text-base md:text-xl font-semibold tracking-tight">Rufrent</span>
        </div>

        <div className="hidden lg:flex flex-1 items-center gap-4">
          <span className="text-lg font-medium">Task Dashboard</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Search - hidden on mobile, shown on tablet+ */}
          <div className="relative hidden sm:block w-40 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Role Badge - hidden on small mobile */}
          <Badge 
            variant="secondary"
            className="hidden sm:flex px-3 py-1"
          >
            {currentUser.role}
          </Badge>

          <div className="flex items-center gap-2 md:gap-3">
            <Avatar className="size-8 md:size-10">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs md:text-sm">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}