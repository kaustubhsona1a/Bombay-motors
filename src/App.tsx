/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';

// Components & Public Layout
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Customer Pages
import { Home } from './pages/Home';
import { Inventory } from './pages/Inventory';
import { VehicleDetails } from './pages/VehicleDetails';
import { SellYourCar } from './pages/SellYourCar';
import { AboutUs } from './pages/AboutUs';

// Dealer Admin Pages
import { DealerDashboard } from './pages/dealer/Dashboard';
import { InventoryManagement } from './pages/dealer/InventoryManagement';
import { AddVehicle } from './pages/dealer/AddVehicle';
import { EditVehicle } from './pages/dealer/EditVehicle';
import { LeadPipeline } from './pages/dealer/LeadPipeline';
import { SettingsPanel } from './pages/dealer/SettingsPanel';

// 1. Layout with Sticky Customer Header and Footer and Fixed Ambient Background
const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] relative overflow-x-hidden">
      {/* Fixed Ambient Background Image */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-15 filter saturate-50 contrast-125 brightness-[0.35] bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1600')`,
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Fixed Gradient Overlay to maintain high contrast for the text */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#09090b]/30 via-[#09090b]/85 to-[#09090b]" />

      <div className="relative z-10 flex flex-col min-h-screen overflow-x-hidden">
        <Navbar />
        <main className="flex-grow pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

// Helper component to handle scrolling to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// 2. Custom clean layout wrapper for Dealer Dashboard without customer navigation
const DealerLayout: React.FC = () => {
  return (
    <div className="bg-[#09090b] min-h-screen">
      <Outlet />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <SiteConfigProvider>
          <AuthProvider>
            <VehicleProvider>
              <Routes>
                
                {/* PUBLIC CUSTOMER PORTAL CHANNELS */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<VehicleDetails />} />
                  <Route path="/sell" element={<SellYourCar />} />
                  <Route path="/about" element={<AboutUs />} />
                </Route>

                {/* SECURED BOMBAY MOTORS DEALER ADMIN COMMANDS */}
                <Route path="/dealer-management" element={<DealerLayout />}>
                  <Route index element={<DealerDashboard />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="inventory/add" element={<AddVehicle />} />
                  <Route path="inventory/edit/:id" element={<EditVehicle />} />
                  <Route path="leads" element={<LeadPipeline />} />
                  <Route path="settings" element={<SettingsPanel />} />
                </Route>

                {/* CATCH-ALL ROUTER REDIRECT */}
                <Route path="*" element={<Home />} />

              </Routes>
            </VehicleProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
