'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenPortal from './citizen/page';
import AdminDashboard from './admin/page';
import CitizenLoginPage from './citizen/login/page';
import UnifiedLoginPage from './login/page';

export default function LandingPage() {
  const { user, isLoadingAuth } = useAuth();
  const isPortalAdmin = process.env.NEXT_PUBLIC_PORTAL_MODE === 'ADMIN';

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Admin Portal mode: requires official stakeholder authentication
  if (isPortalAdmin) {
    if (!user || user.role === 'CITIZEN') {
      return <UnifiedLoginPage />;
    }
    return <AdminDashboard />;
  }

  // Citizen Portal mode: requires citizen authentication
  if (!user || user.role !== 'CITIZEN') {
    return <CitizenLoginPage />;
  }

  return <CitizenPortal />;
}
