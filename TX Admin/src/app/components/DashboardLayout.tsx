import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  onLogout: () => void;
}

export default function DashboardLayout({ children, title, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      <Sidebar
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Main content: offset by sidebar width on large screens */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <TopBar
          title={title}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
