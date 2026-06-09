/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicles } from '../../context/VehicleContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'motion/react';
import { 
  Car, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  PlusCircle, 
  Settings, 
  LogOut, 
  MessageSquare,
  Lock,
  Compass,
  ArrowUpRight,
  Sparkles,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';

export const DealerDashboard: React.FC = () => {
  const { user, signInWithGoogle, signInWithCredentials, signInDemoAdmin, signOutUser, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { vehicles, leads } = useVehicles();
  const { siteConfig } = useSiteConfig();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Credential login states
  const [emailInput, setEmailInput] = React.useState('');
  const [passwordInput, setPasswordInput] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');

  // 1. CALCULATE METRICS DYNAMICALLY
  const metrics = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeInventory = vehicles.filter((v) => v.status === 'active').length;
    const soldVehicles = vehicles.filter((v) => v.status === 'sold').length;
    const openLeads = leads.filter((l) => l.status !== 'SOLD' && l.status !== 'CLOSED').length;
    
    // Sum pricing of non-archived inventory in Lakhs
    const portfolioValue = vehicles
      .filter((v) => v.status !== 'archived')
      .reduce((sum, v) => sum + v.price, 0);

    return {
      totalVehicles,
      activeInventory,
      soldVehicles,
      openLeads,
      portfolioValue,
    };
  }, [vehicles, leads]);

  const handleDemoSignIn = async () => {
    try {
      await signInDemoAdmin();
      showToast('Welcome inside Bombay Motors Dashboard!', 'success');
    } catch {
      showToast('Demo login error', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      showToast('Admin authenticated successfully.', 'success');
    } catch {
      showToast('Google Sign-In canceled or blocked.', 'warning');
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setLoginError('Complete ID credentials and branch passcode credentials.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const success = await signInWithCredentials(emailInput, passwordInput);
      if (success) {
        showToast('Access authorized! Redirecting to CRM workspace.', 'success');
      } else {
        setLoginError('Invalid registered Staff ID or branch passcode.');
        showToast('Security verification failed.', 'error');
      }
    } catch (err) {
      setLoginError('Operational interface error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. RENDER THE LOGIN PORTAL FOR UNAUTHORIZED USERS
  if (isAuthLoading) {
    return (
      <div className="bg-[#09090b] min-h-screen text-white flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Validating Executive Token...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen flex items-center justify-center py-16 px-4 font-sans relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.02),transparent_60%)]" />

        <div className="relative z-10 w-full max-w-md bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl flex flex-col items-center">
          
          {/* Logo Heading inside Card */}
          <div className="flex flex-col items-center mb-6 select-none">
            <span className="font-sans font-black text-2xl tracking-tighter text-white uppercase flex items-center gap-1 leading-none">
              BOMBAY <span className="text-[#c5a059] font-medium font-mono text-sm border-l border-white/20 pl-2">MOTORS</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.3em] text-[#71717a] mt-2">DEALER COMMAND CENTER</span>
          </div>

          <div className="p-4 bg-zinc-950/80 border border-white/[0.02] rounded-xl text-center mb-6 w-full">
            <Lock className="w-4 h-4 text-[#c5a059] mx-auto mb-1.5" />
            <h3 className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">SECURE STAFF LOGIN</h3>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5 max-w-xs leading-relaxed">
              Enter registered Bombay Motors staff ID/Email & Branch Passcode keys (e.g. <code>bombaymotors55@gmail.com</code> & <code>bombay55</code>)
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleCredentialSubmit} className="w-full flex flex-col gap-4">
            {loginError && (
              <div className="p-3 bg-red-950/20 border border-red-900/10 text-red-400 text-[10px] uppercase font-mono tracking-wider rounded-lg text-center">
                ⚠️ {loginError}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Registered Email ID</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setLoginError('');
                }}
                placeholder="registered-name@example.com"
                className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1 relative">
              <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Operational Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-lg p-3 pr-10 text-xs text-white font-mono focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#c5a059] text-zinc-950 font-sans font-bold text-xs uppercase tracking-widest rounded-lg transition-all hover:bg-[#b48a47] flex items-center justify-center gap-2 cursor-pointer shadow-lg outline-none disabled:opacity-40"
            >
              {isLoggingIn ? 'AUTHORIZING STATION...' : 'AUTHORIZE STATION'}
            </button>
          </form>

          {/* Secondary fallback gates */}
          <div className="w-full border-t border-white/[0.04] mt-6 pt-5 flex flex-col gap-2.5">
            <span className="text-[9px] font-mono text-zinc-600 text-center uppercase tracking-widest">or integrate instantly</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs text-white font-sans font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none"
              >
                Google Authentication
              </button>

              <button
                onClick={handleDemoSignIn}
                className="py-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-dashed border-white/5 text-[9px] text-[#c5a059] font-mono uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer outline-none"
              >
                ✨ One-Tap Demo
              </button>
            </div>
          </div>

          {/* Fallback back home Link */}
          <Link to="/" className="text-[9px] text-zinc-600 hover:text-zinc-400 mt-6 font-mono tracking-widest uppercase">
            ← CANCEL & RETURN TO PUBLIC SITE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-10 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* CRM Dashboard header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-6 border-b border-white/5">
          <div>
            <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase"> EXECUTIVE Cockpit </span>
            <h1 className="text-3xl font-sans font-black uppercase text-white leading-none mt-1">
              COMMAND DASHBOARD
            </h1>
            <p className="text-xs text-zinc-500 font-sans mt-1">
              Logged in as <span className="text-zinc-300 font-mono">{user.email}</span> (Boutique Admin)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={signOutUser}
              className="border border-white/10 hover:border-rose-500/30 hover:bg-rose-950/10 text-zinc-400 hover:text-rose-200 px-4 py-2.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer outline-none"
            >
              <LogOut className="w-3.5 h-3.5" /> SIGN OUT
            </button>
          </div>
        </div>

        {/* CRM NAV RAILS ACCENT LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center font-sans tracking-wide">
          <Link
            to="/dealer-management/inventory"
            className="p-4 rounded-xl border border-white/5 bg-[#121214] hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 transition-all text-xs font-bold uppercase text-zinc-300 hover:text-white"
          >
            Manage Showroom Stock
          </Link>
          <Link
            to="/dealer-management/leads"
            className="p-4 rounded-xl border border-white/5 bg-[#121214] hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 transition-all text-xs font-bold uppercase text-zinc-300 hover:text-white"
          >
            Leads Pipeline board
          </Link>
          <Link
            to="/dealer-management/inventory/add"
            className="p-4 rounded-xl border border-[#c5a059]/20 bg-[#c5a059]/5 hover:border-[#c5a059]/60 hover:bg-[#c5a059]/10 transition-all text-xs font-bold uppercase text-[#c5a059] flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 shrink-0" /> Launch New Vehicle
          </Link>
          <Link
            to="/dealer-management/settings"
            className="p-4 rounded-xl border border-white/5 bg-[#121214] hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 transition-all text-xs font-bold uppercase text-zinc-300 hover:text-white"
          >
            Settings & Coordinates
          </Link>
        </div>

        {/* 3. CORE METRIC BLOCKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          
          {/* Metric 1 */}
          <div className="bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">TOTAL listings</span>
            <div className="font-mono text-3xl font-bold text-white mt-2 mb-1">{metrics.totalVehicles}</div>
            <p className="text-[11px] text-zinc-600 font-mono">Showroom historical stock count</p>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ACTIVE SHOWCASE</span>
            <div className="font-mono text-3xl font-bold text-emerald-400 mt-2 mb-1">{metrics.activeInventory}</div>
            <p className="text-[11px] text-zinc-600 font-mono">Displayed in public browser catalog</p>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">SOLD MACHINES</span>
            <div className="font-mono text-3xl font-bold text-amber-500 mt-2 mb-1">{metrics.soldVehicles}</div>
            <p className="text-[11px] text-zinc-600 font-mono">Handover ceremonies completed</p>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04]">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CRM OPEN LEADS</span>
            <div className="font-mono text-3xl font-bold text-[#c5a059] mt-2 mb-1">{metrics.openLeads}</div>
            <p className="text-[11px] text-zinc-600 font-mono">Awaiting callbacks and negotiation</p>
          </div>

          {/* Metric 5 */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">PORTFOLIO value</span>
              <div className="font-mono text-2xl font-bold text-white mt-2 mb-1">₹{metrics.portfolioValue.toFixed(1)}L</div>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono uppercase leading-tight">ACTIVE SHOWCASE WORTH</p>
          </div>
        </div>

        {/* 4. METRIC FEED CHANNELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Quick Listings View */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans font-bold text-white uppercase text-xs tracking-wider">Showroom Inventory</h3>
              <Link to="/dealer-management/inventory" className="text-[10px] font-mono text-[#c5a059] uppercase hover:underline flex items-center gap-1">
                Full list <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {vehicles.length === 0 ? (
                <div className="py-8 text-center text-zinc-600 text-xs">No active stock in database.</div>
              ) : (
                vehicles.slice(0, 4).map((vehicle) => (
                  <div key={vehicle.id} className="p-3 bg-zinc-950/60 rounded-xl border border-white/[0.02] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={vehicle.images[0]} alt="Show" className="w-12 aspect-video object-cover rounded-lg" />
                      <div>
                        <h4 className="font-sans font-bold text-xs text-white uppercase">{vehicle.make} {vehicle.model}</h4>
                        <span className="text-[9px] font-mono uppercase text-zinc-500">{vehicle.year} • {vehicle.registration}</span>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-mono font-bold text-[#c5a059]">₹{vehicle.price}L</span>
                      <span className={`text-[9px] font-mono uppercase font-bold ${
                        vehicle.status === 'active' ? 'text-emerald-400' : 'text-amber-500'
                      }`}>{vehicle.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Leads pipeline View */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans font-bold text-white uppercase text-xs tracking-wider">CRM leads feed</h3>
              <Link to="/dealer-management/leads" className="text-[10px] font-mono text-[#c5a059] uppercase hover:underline flex items-center gap-1">
                Pipeline board <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {leads.length === 0 ? (
                <div className="py-8 text-center text-zinc-600 text-xs">No active CRM client leads found.</div>
              ) : (
                leads.slice(0, 4).map((lead) => (
                  <div key={lead.id} className="p-3.5 bg-zinc-950/60 rounded-xl border border-white/[0.02] flex items-center justify-between gap-4 text-xs font-sans">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white uppercase">{lead.customerName}</span>
                      <span className="text-[9px] text-[#c5a059] font-mono uppercase tracking-wider">{lead.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 select-none">
                      <span className="bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-400 uppercase font-bold">{lead.status}</span>
                      <span className="text-[9px] font-mono text-zinc-600">{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
