import { Search, Building2, Menu } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import type { User } from '@/app/data/mock-data';
import logo from "/logo.png";


interface TopNavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

export function TopNavbar({ currentUser, searchQuery, onSearchChange, onMenuClick, onProfileClick }: TopNavbarProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: '#001433' }}>
      <div className="flex h-14 md:h-[72px] items-center gap-2 md:gap-4 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Rufrent" className="h-6 md:h-8" />
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Search - only visible on mobile/tablet, hidden on desktop (lg+) */}
          <div className="relative hidden sm:block lg:hidden w-40 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Role Badge - hidden on small mobile */}
          <Badge 
            variant="secondary"
            className="hidden sm:flex px-3 py-1 bg-white/20 text-white border-white/30"
          >
            {currentUser.role}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="size-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* User Details - clickable to open profile modal */}
              <div 
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={onProfileClick}
              >
                <Avatar className="size-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {currentUser.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}