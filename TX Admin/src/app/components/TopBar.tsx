import { Bell, User, Menu } from 'lucide-react';
import { useState } from 'react';

interface TopBarProps {
  title: string;
  onMenuToggle: () => void;
}

export default function TopBar({ title, onMenuToggle }: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-[#1a1a1a] border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-neutral-400 hover:bg-[#0f0f0f] hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg md:text-xl text-white font-medium">{title}</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-[#0f0f0f] transition-colors">
          <Bell className="w-5 h-5 text-neutral-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#dc2626] rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[#0f0f0f] transition-colors"
          >
            <div className="w-8 h-8 bg-[#dc2626] rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm text-white">Admin</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50">
              <button className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-[#0f0f0f] transition-colors">
                Profile
              </button>
              <button className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-[#0f0f0f] transition-colors">
                Settings
              </button>
              <button className="w-full px-4 py-3 text-left text-sm text-[#dc2626] hover:bg-[#0f0f0f] transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
