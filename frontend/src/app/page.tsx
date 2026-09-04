'use client';

import React from 'react';
import CitizenPortal from './citizen/page';
import AdminDashboard from './admin/page';

export default function LandingPage() {
  const isPortalAdmin = process.env.NEXT_PUBLIC_PORTAL_MODE === 'ADMIN';

  if (isPortalAdmin) {
    return <AdminDashboard />;
  }

  return <CitizenPortal />;
}

