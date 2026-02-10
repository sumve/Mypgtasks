import { Search, Building2, Menu } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
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
          {/* Search - hidden on mobile, shown on tablet+ */}
          <div className="relative hidden sm:block w-40 md:w-80">
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

          <button 
            onClick={onProfileClick}
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="size-8 md:size-10">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs md:text-sm">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-white">{currentUser.name}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}