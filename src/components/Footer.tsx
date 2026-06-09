/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Shield, Clock, MapPin, Phone, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteConfig } = useSiteConfig();

  return (
    <footer className="bg-[#09090b] border-t border-white/5 py-12 px-6 md:px-8 text-[#a1a1aa] font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Link to="/" className="font-sans font-bold text-lg tracking-tight text-white uppercase leading-none select-none">
              BOMBAY <span className="text-[#c5a059] font-medium font-mono text-xs">MOTORS</span>
            </Link>
            <Link
              to="/dealer-management"
              className="text-[8px] font-mono tracking-[0.25em] text-[#3f3f46] hover:text-[#c5a059]/40 transition-colors mt-1 block select-none uppercase"
              title="Dealer Desk Gateway"
            >
              ESTD. MUMBAI
            </Link>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed pr-6">
            Mumbai's premier pre-owned luxury car boutique. Our vehicles undergo standard multi-point certifications to ensure your supreme safety on roads.
          </p>
        </div>

        {/* Showroom links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-widest font-semibold font-mono text-[#c5a059]">DIRECTORY</h4>
          <ul className="flex flex-col gap-2 text-sm text-zinc-400">
            <li>
              <Link to="/inventory" className="hover:text-white transition-colors">Browse Stock</Link>
            </li>
            <li>
              <Link to="/sell" className="hover:text-white transition-colors">Sell Your Automobile</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">Our Showroom</Link>
            </li>
          </ul>
        </div>

        {/* Timings */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-widest font-semibold font-mono text-[#c5a059]">OPERATIONS</h4>
          <div className="flex flex-col gap-2 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>{siteConfig.businessHours}</span>
            </span>
            <span className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed">{siteConfig.address}</span>
            </span>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-widest font-semibold font-mono text-[#c5a059]">CONTACT</h4>
          <div className="flex flex-col gap-2 text-sm text-zinc-400">
            <a 
              href={`tel:${siteConfig.phone}`}
              className="flex items-center gap-2 hover:text-[#c5a059] hover:underline transition-colors"
            >
              <Phone className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>{siteConfig.phone}</span>
            </a>
            <a 
              href={siteConfig.instagram.startsWith('http') ? siteConfig.instagram : `https://instagram.com/${siteConfig.instagram.replace('@', '')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4 text-zinc-600 shrink-0" />
              <span>{siteConfig.instagram.startsWith('http') ? '@' + siteConfig.instagram.split('/').filter(Boolean).pop() : siteConfig.instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Dividers & Legal Disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center">
        <p className="text-[11px] text-zinc-600 max-w-2xl leading-relaxed text-center md:text-left">
          {siteConfig.legalNotes}
        </p>
        <span className="text-[11px] text-zinc-500 tracking-wider text-center md:text-right shrink-0">
          {siteConfig.footerText}
        </span>
      </div>
    </footer>
  );
};
