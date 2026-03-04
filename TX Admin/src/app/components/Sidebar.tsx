import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Archive, 
  Percent, 
  Mail, 
  BarChart3, 
  Settings,
  Component,
  Zap
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
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

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1a1a1a] border-r border-neutral-800 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-xl tracking-tight text-white">
          TOXIC SOCIETY
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Admin Dashboard</p>
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
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-[#dc2626] text-white' 
                      : 'text-neutral-400 hover:bg-[#0f0f0f] hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
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
          className="w-full px-4 py-3 rounded-xl text-sm text-neutral-400 hover:bg-[#0f0f0f] hover:text-white transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
