import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CheckInModal } from '../attendance/CheckInModal';
import { LogoutConfirmModal } from '../auth/LogoutConfirmModal';
import { useBackendSync } from '../../hooks/useBackendSync';

export const MainLayout: React.FC = () => {
  useBackendSync();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogoutClick={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onLogoutClick={() => setIsLogoutConfirmOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />

      {/* Global Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
