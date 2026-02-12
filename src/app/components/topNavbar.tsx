import { Search } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import type { User } from '@/app/data/mock-data';
import logo from 'figma:asset/33ec04c21ea655fdb9574bd0a62d6cd455f16db6.png';

interface TopNavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProfileClick?: () => void;
}

export function TopNavbar({ currentUser, searchQuery, onSearchChange, onProfileClick }: TopNavbarProps) {
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

          {/* Staff Initials Avatar - Clickable for Profile */}
          <button
            onClick={onProfileClick}
            className="hover:opacity-80 transition-opacity"
            aria-label="View profile"
          >
            <Avatar className="size-8 md:size-9 cursor-pointer">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </div>
  );
}