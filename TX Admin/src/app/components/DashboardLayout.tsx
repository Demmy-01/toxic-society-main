import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  onLogout: () => void;
}

export default function DashboardLayout({ children, title, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 ml-64">
        <TopBar title={title} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
