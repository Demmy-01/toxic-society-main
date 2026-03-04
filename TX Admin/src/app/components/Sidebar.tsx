import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Archive, 
  Percent, 
  Mail, 
  BarChart3, 
  Settings,
  Component,
  Zap,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Zap, label: 'Drops', path: '/drops' },
  { icon: Archive, label: 'Inventory', path: '/inventory' },
  { icon: Percent, label: 'Discounts', path: '/discounts' },
  { icon: Mail, label: 'Email Campaigns', path: '/email-campaigns' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Component, label: 'Components', path: '/components' },
];

export default function Sidebar({ onLogout, isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const SidebarContent = () => (
    <aside className="w-64 bg-[#1a1a1a] border-r border-neutral-800 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl tracking-tight text-white">TOXIC SOCIETY</h1>
          <p className="text-xs text-neutral-500 mt-1">Admin Dashboard</p>
        </div>
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-[#dc2626] text-white'
                      : 'text-neutral-400 hover:bg-[#0f0f0f] hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-neutral-400 hover:bg-[#0f0f0f] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-30">
        <SidebarContent />
      </div>

      {/* Mobile sidebar - drawer overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-screen w-64 z-50 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
