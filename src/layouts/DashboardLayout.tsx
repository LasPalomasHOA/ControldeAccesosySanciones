import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useHOA } from '../context/HOAContext';

export const DashboardLayout: React.FC = () => {
  const { usuarioActual } = useHOA();

  // If a provider logs in, redirect them to their specific rule acceptance page if needed,
  // but let routing handle it. We can check if they are supplier and not on supplier page.
  // Actually, we'll configure standard routes.

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden w-full text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Topbar />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
