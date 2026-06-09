/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import { Phone, Instagram, Shield, HelpCircle, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if current path is in dealer portal
  const isDealerPortal = location.pathname.startsWith('/dealer-management');

  const links = [
    { label: 'Showroom', path: '/inventory' },
    { label: 'Sell Your Car', path: '/sell' },
    { label: 'About Us', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Format phone number to clean WhatsApp link
  const formattedWhatsApp = siteConfig.whatsApp ? siteConfig.whatsApp.replace(/[^0-9]/g, '') : '';

  return (
    <header className="w-full z-40 bg-[#09090b] border-b border-white/5">
      {/* Primary header navbar */}
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center relative">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 select-none group" id="nav-logo">
          {siteConfig.logoUrl ? (
            <img 
              src={siteConfig.logoUrl} 
              alt="Bombay Motors Logo" 
              className="h-9 w-auto object-contain max-w-[120px] filter brightness-105 transition-all group-hover:opacity-90"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg border border-white/10 flex items-center justify-center text-[11px] font-mono font-medium text-[#c5a059] bg-white/[0.03] transition-colors group-hover:border-[#c5a059]/40 group-hover:bg-white/[0.06]">
              BM
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-sans font-bold text-lg md:text-xl tracking-tight text-white uppercase flex items-center gap-1.5 leading-none transition-colors group-hover:text-[#c5a059]">
              BOMBAY <span className="text-[#c5a059] font-medium font-mono text-sm border-l border-white/20 pl-2">MOTORS</span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.22em] text-zinc-400 mt-1.5 uppercase">APPROVED SHOWROOM</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 pl-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-sans text-sm tracking-wide font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-[#c5a059]'
                  : 'text-[#f4f4f5] hover:text-[#c5a059]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono tracking-wider">
          {/* Instagram Link */}
          <a
            href={siteConfig.instagram.startsWith('http') ? siteConfig.instagram : `https://instagram.com/${siteConfig.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-[#c5a059] px-3.5 py-2 hover:bg-white/[0.02] rounded-full transition-colors border border-transparent hover:border-white/5 uppercase"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </a>

          {/* WhatsApp Link */}
          <a
            href={`https://wa.me/${formattedWhatsApp}?text=Hi%20Bombay%20Motors,%20I%20am%20interested%20in%20viewing%20your%20inventory.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 border border-emerald-500/25 bg-emerald-950/10 hover:border-emerald-500/55 hover:bg-emerald-950/25 px-3.5 py-2 rounded-full font-medium transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008 0c3.202.001 6.212 1.244 8.477 3.507 2.266 2.264 3.507 5.275 3.507 8.479-.005 6.657-5.34 11.996-11.953 11.996-2.007-.002-3.978-.507-5.719-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.455 5.516 0 10.002-4.484 10.006-9.997.002-2.672-1.03-5.185-2.907-7.062C16.68 1.674 14.17 .642 11.999.641a9.99 9.99 0 0 0-10.001 10c0 1.69.444 3.321 1.284 4.77l-.997 3.637 3.734-.98c1.439.784 2.973 1.15 4.605 1.151h.033zm11.233-7.512c-.31-.155-1.833-.903-2.115-1.006-.282-.103-.487-.156-.692.155-.205.311-.796 1.006-.974 1.21-.18.207-.36.23-.67.075-.31-.155-1.314-.484-2.503-1.545-.925-.824-1.55-1.84-1.732-2.15-.18-.31-.019-.478.136-.632.14-.139.31-.361.465-.542.156-.181.205-.31.31-.516.103-.207.051-.387-.026-.542-.077-.156-.692-1.666-.948-2.285-.25-.6-.5-.516-.692-.526-.179-.009-.384-.01-.59-.01-.205 0-.54.077-.822.387-.282.31-1.077 1.051-1.077 2.562 0 1.511 1.1 2.97 1.253 3.177.154.206 2.164 3.3 5.241 4.63.733.315 1.305.503 1.752.645.736.234 1.405.201 1.934.121.59-.09 1.833-.748 2.09-1.432.256-.684.256-1.271.18-1.391-.077-.12-.282-.185-.592-.34z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-zinc-300 hover:text-white focus:outline-none p-1"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Flyout Navigation menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-[#121214] border-b border-white/10 p-6 z-50 shadow-2xl md:hidden">
            <div className="flex flex-col gap-5">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`font-sans text-base font-semibold ${
                    isActive(link.path) ? 'text-[#c5a059]' : 'text-zinc-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="border-white/5 my-2" />

              {/* Mobile CTAs */}
              <a
                href={siteConfig.instagram.startsWith('http') ? siteConfig.instagram : `https://instagram.com/${siteConfig.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-white/[0.02] border border-white/5 text-zinc-300 rounded-lg font-sans font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/20 hover:text-[#c5a059] transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-500" /> Instagram Handle
              </a>

              <a
                href={`https://wa.me/${formattedWhatsApp}?text=Hi%20Bombay%20Motors,%20I%20am%20interested%20in%20viewing%20your%20inventory.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 rounded-lg font-sans font-medium text-sm flex items-center justify-center gap-2"
              >
                Chat on WhatsApp
              </a>

            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
