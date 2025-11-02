import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Settings, User, LogOut, Menu } from 'lucide-react';
import { useAdmin } from './admin-context-new';
import { EnhancedLogo } from './enhanced-logo';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, setCurrentPage, logout } = useAdmin();

  const handleLogout = async () => {
    await logout();
  };

  const handleProfile = () => {
    setCurrentPage('profile');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger Menu (Mobile) + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="w-6 h-6 flex items-center justify-center">
            <EnhancedLogo />
          </div>
        </div>

        {/* Right side - User button */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            variant="ghost" 
            onClick={handleProfile}
            className="px-2 md:px-4 py-2 rounded-md text-gray-700 hover:text-[#6a40ec] hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6a40ec] focus:ring-offset-2"
          >
            <User className="h-4 w-4 md:mr-2" />
            <span className="hidden sm:inline">{user?.name || 'User'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}