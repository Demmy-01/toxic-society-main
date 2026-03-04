import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-[#1a1a1a] border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
      {/* Page Title */}
      <h2 className="text-xl text-white">{title}</h2>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-[#0f0f0f] transition-colors">
          <Bell className="w-5 h-5 text-neutral-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#dc2626] rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-[#0f0f0f] transition-colors"
          >
            <div className="w-8 h-8 bg-[#dc2626] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-white">Admin</span>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
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
