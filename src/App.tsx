import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { PlansPage } from './pages/PlansPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { BranchesPage } from './pages/BranchesPage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
