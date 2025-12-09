
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { SocialLinks } from './pages/public/SocialLinks';
import { GiftCardPage } from './pages/public/GiftCard';
import { GiftCardView } from './pages/public/GiftCardView';
import { Pricing } from './pages/public/Pricing';
import { Coaching } from './pages/public/Coaching';
import { Collaboration } from './pages/public/Collaboration';
import { Dashboard } from './pages/admin/Dashboard';
import { Clients } from './pages/admin/Clients';
import { Accounting } from './pages/admin/Accounting';
import { Suppliers } from './pages/admin/Suppliers';
import { AdminGiftCards } from './pages/admin/GiftCards';
import { Settings } from './pages/admin/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SocialLinks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/coaching" element={<Coaching />} />
        <Route path="/collab" element={<Collaboration />} />
        <Route path="/gift-card" element={<GiftCardPage />} />
        <Route path="/view-card" element={<GiftCardView />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/clients" element={<AdminLayout><Clients /></AdminLayout>} />
        <Route path="/admin/accounting" element={<AdminLayout><Accounting /></AdminLayout>} />
        <Route path="/admin/suppliers" element={<AdminLayout><Suppliers /></AdminLayout>} />
        <Route path="/admin/gift-cards" element={<AdminLayout><AdminGiftCards /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
      </Routes>
    </HashRouter>
  );
};

export default App;
