/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { MapPin, Phone, MessageCircle, Star, ShieldCheck, HelpCircle, Award, Compass, Timer } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const formattedWhatsApp = siteConfig.whatsApp ? siteConfig.whatsApp.replace(/[^0-9]/g, '') : '';

  return (
    <div className="bg-transparent text-[#f4f4f5] min-h-screen pt-28 md:pt-32 pb-16 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* About heading */}
        <div className="text-center mb-16">
          <span className="text-[#c5a059] font-mono text-xs tracking-[0.25em] uppercase">BOUTIQUE HISTORY</span>
          <h1 className="text-3xl md:text-5xl font-sans font-bold text-white uppercase tracking-tight mt-1 leading-none">
            BOMBAY MOTORS
          </h1>
          
          {/* Legacy Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full mt-4 text-xs font-mono text-[#c5a059] tracking-wider uppercase animate-pulse">
            <Award className="w-3.5 h-3.5 text-[#c5a059]" /> ESTD. 1986 • CELEBRATING 40 YEARS OF FAMILY TRUST
          </div>
          
          <p className="text-sm text-zinc-500 mt-4 max-w-lg mx-auto">
            {siteConfig.aboutSubtitle || "Mumbai's highly trusted destination for certified, high-quality family hatchbacks, SUVs, and sedans on L.B.S. Marg, Mulund West."}
          </p>
        </div>

        {/* Nostalgic 40-Year Timeline Block */}
        <div className="mb-16 bg-[#121214] border border-white/[0.04] rounded-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#c5a059]/5 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-8">
            <Timer className="w-5 h-5 text-[#c5a059]" />
            <span className="font-mono text-xs text-zinc-450 uppercase tracking-widest">FOUR DECADES ON LBS MARG</span>
            <span className="text-zinc-700 font-sans text-xs">•</span>
            <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">
              Milestones of Integrity (1986 - 2026)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="flex flex-col gap-2 relative p-4 bg-zinc-900/40 rounded-xl border border-white/[0.02]">
              <span className="text-[#c5a059] font-mono text-xl font-bold">1986</span>
              <span className="text-xs font-sans font-bold text-white uppercase tracking-wide">The Ignition Corner</span>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Started as a humble single-car display on L.B.S. Marg. Minimal glitz—just clean mechanics and 100% honest agreements.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 relative p-4 bg-zinc-900/40 rounded-xl border border-white/[0.02]">
              <span className="text-[#c5a059] font-mono text-xl font-bold">1998</span>
              <span className="text-xs font-sans font-bold text-white uppercase tracking-wide">2,500th Vehicle Key</span>
              <p className="text-zinc-400 text-xs leading-relaxed">
                As the classic Maruti Zen and Honda City ruled Mumbai roads, we became Mulund's local authority on hassle-free RTO paperwork.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 relative p-4 bg-zinc-900/40 rounded-xl border border-white/[0.02]">
              <span className="text-[#c5a059] font-mono text-xl font-bold">2012</span>
              <span className="text-xs font-sans font-bold text-white uppercase tracking-wide">Generational Trust</span>
              <p className="text-zinc-400 text-xs leading-relaxed">
                The children of our 1980s buyers began returning for automatic family sedans, cementing three decades of peerless goodwill.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 relative p-4 bg-zinc-900/40 rounded-xl border border-[#c5a059]/20 shadow-[0_4px_20px_rgba(197,160,89,0.05)]">
              <span className="text-[#c5a059] font-mono text-xl font-bold">2026</span>
              <span className="text-xs font-sans font-bold text-white uppercase tracking-wide">40-Year Jubilee</span>
              <p className="text-zinc-300 text-xs leading-relaxed font-light">
                15,000+ family journeys launched! Celebrating four decades of pristine digital checklists, zero-discrepancy miles, and happy smiles.
              </p>
            </div>
          </div>
        </div>

        {/* Main Showroom Banner / Custom About Photo */}
        {siteConfig.aboutSectionPhoto && (
          <div className="max-w-3xl mx-auto w-full rounded-2xl overflow-hidden border border-white/5 mb-16 relative aspect-[4/3] sm:aspect-[16/10] md:max-h-[480px]">
            <img 
              src={siteConfig.aboutSectionPhoto} 
              alt="Bombay Motors Boutique" 
              className="w-full h-full object-cover select-none pointer-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 md:left-8">
              <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">LBS MARG SHOWROOM</span>
              <h2 className="text-white font-sans font-bold text-base md:text-xl uppercase tracking-wider mt-1">
                Where Trust Meets Integrity
              </h2>
            </div>
          </div>
        )}

        {/* Brand identity overview layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start mb-16">
          <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
            <h2 className="text-xl md:text-2xl font-sans font-bold text-white uppercase tracking-wide">
              {siteConfig.aboutHeroTitle || "YOUR FAMILY’S SAFEST & MOST RELIABLE DRIVE RUNS HERE"}
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-light">
              {siteConfig.aboutDescription || "At Bombay Motors, we understand that buying a pre-owned car is a milestone for your family. We are not interested in overhyping luxury. Instead, we focus on delivering high-quality, practical mass-market family cars—like Toyota, Hyundai, Maruti Suzuki, Honda, and Tata—at honest, transparent prices. Every family car in our inventory opposing Santoshimata Mandir undergoes an exhaustive multi-point check check covering engine longevity, safety airbags, braking efficiency, and complete structural integrity so your loved ones remain safe."}
            </p>
            <p className="text-[#a1a1aa] text-xs font-mono tracking-wide leading-relaxed border-l border-[#c5a059] pl-4">
              {siteConfig.aboutStory || "We specialize in providing a 100% hassle-free buying experience. From certified on-road quality verification to swift RTO paper transfers and low-interest bank loan tie-ups, Bombay Motors handles every little detail. Your satisfaction and family's smiles are our business's true engine."}
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 bg-[#121214] border border-white/5 rounded-xl p-6">
            <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-[#c5a059] mb-4">SHOWROOM VITALS</h3>
            <div className="flex flex-col gap-4 font-sans text-xs">
              <a 
                href={siteConfig.googleReviewsUrl || "https://www.google.com/maps/search/?api=1&query=Bombay+Motors+Ekta+Apartment+LBS+Marg+Mulund+West+Mumbai"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#c5a059] fill-[#c5a059]" />
                  <span className="text-[#f4f4f5] font-medium font-mono group-hover:text-[#c5a059] transition-colors">
                    Google Rating: {siteConfig.googleRating || 4.3} ★
                  </span>
                </div>
                <div className="text-zinc-450 font-mono text-xs uppercase tracking-wider pl-6 mt-1.5 font-medium">
                  Verified across {siteConfig.reviewsCount || 109} local Mumbai client reviews.
                </div>
              </a>
              <hr className="border-white/5" />
              <div className="flex items-start gap-2">
                <Timer className="w-4.5 h-4.5 text-zinc-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f4f4f5] font-medium font-mono">SHOWROOM TIMINGS</span>
                  <p className="text-zinc-400 text-xs mt-1 leading-none font-mono font-medium">{siteConfig.businessHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Coordinates & Directions Card */}
        <div className="bg-[#121214] border border-white/[0.04] rounded-2xl p-6 md:p-8 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="font-sans font-bold text-lg text-white uppercase tracking-wider">Showroom Coordinates</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Providing active navigation support globally.</p>
            </div>
            <a 
              href={siteConfig.googleMapsUrl || "https://maps.google.com/?q=1-A,+Ekta+Apartment,+L.B.S.+Marg,+Mulund+West,+Opposite+Santoshimata+Mandir,+Mumbai"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-zinc-900 border border-white/10 hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 rounded-lg text-xs font-sans tracking-widest uppercase transition-all duration-300 flex items-center gap-2 text-white"
            >
              <Compass className="w-4 h-4 text-[#c5a059]" /> Get Navigation Route
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">SHOWROOM ADDRESS</span>
              <p className="text-sm font-sans text-zinc-300 leading-relaxed font-light">{siteConfig.address}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">LANDMARKS / SIGNPOSTS</span>
              <p className="text-sm font-sans text-[#c5a059] leading-relaxed">Directly Opposite to historical Santoshimata Mandir, L.B.S. Marg, Mulund West.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-center">
            <div className="flex flex-col items-center">
              <Phone className="w-5 h-5 text-[#c5a059] mb-2" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase">DIRECT CALLS</span>
              <a href={`tel:${siteConfig.phone}`} className="text-sm font-mono font-medium text-white hover:underline mt-1">{siteConfig.phone}</a>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="w-5 h-5 text-emerald-500 mb-2" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase">WHATSAPP CHAT</span>
              <a href={`https://wa.me/${formattedWhatsApp}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono font-medium text-white hover:underline mt-1">Chat Instantly</a>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 text-[#c5a059] mb-2" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase">METRO NEAREST</span>
              <span className="text-sm font-sans text-white font-medium mt-1">Mulund Railway Station</span>
            </div>
          </div>
        </div>

         {/* Happy Customers Handover Gallery */}
        {siteConfig.happyCustomers && siteConfig.happyCustomers.length > 0 && (
          <div className="mb-16 border-t border-white/[0.04] pt-16">
            <div className="text-center mb-12">
              <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">MOMENTS OF JOY</span>
              <h3 className="text-xl md:text-2xl font-sans font-bold text-white uppercase tracking-tight mt-1">
                MEMORIES ON THE ROAD
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Real, candid snapshots of happy keys and vehicle handovers outside our Boutique. Feel the legacy we've built, one smile at a time!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
              {siteConfig.happyCustomers.map((photoUrl, index) => {
                // A dynamic set of warm, playful hand-written style captions
                const captions = [
                  "🔑 Smiles at LBS Marg showroom!",
                  "✨ Family approved: Another pristine drive!",
                  "🚗 Certified safe & ready for highway memories!",
                  "💖 Celebrating 40 years of local trust!",
                  "🚀 Key handover—dreams set in motion!",
                  "🌟 Trusted by three generations of drivers!",
                  "🏁 A gorgeous milestone on Mumbai roads!",
                  "💎 Spotless inside-out delivery!",
                  "🏡 Heading home to Mulund West in style!"
                ];
                const caption = captions[index % captions.length];
                
                // Index-based tactile rotation for organic vintage scrapbook styling
                const rotation = index % 3 === 0 
                  ? 'rotate-[-2deg] hover:rotate-1' 
                  : index % 3 === 1 
                    ? 'rotate-[2deg] hover:rotate-[-1deg]' 
                    : 'rotate-[1deg] hover:rotate-[-2deg]';
                
                return (
                  <div 
                    key={index} 
                    className={`group bg-[#fafaf9] p-4 pb-7 rounded-sm shadow-[0_12px_35px_rgba(0,0,0,0.65)] border border-neutral-300 relative transition-all duration-500 hover:scale-[1.04] hover:z-20 ${rotation}`}
                  >
                    {/* Retro sticky tape at the top of the polaroid for scrapbook style */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#c5a059]/30 backdrop-blur-[1px] border border-white/20 shadow-sm pointer-events-none" />
                    
                    {/* The core image representation */}
                    <div className="w-full aspect-square overflow-hidden bg-neutral-950 border border-neutral-200 rounded-sm relative shadow-inner">
                      <img 
                        src={photoUrl} 
                        alt={`Bombay Motors Happy Client Handover ${index + 1}`}
                        className="w-full h-full object-cover filter brightness-[0.97] contrast-[1.03] transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive Stamp overlay */}
                      <div className="absolute top-2 right-2 border-2 border-emerald-600/80 text-emerald-600 font-mono text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-sm bg-neutral-900/45 backdrop-blur-[2.5px] rotate-12 select-none pointer-events-none">
                        ✓ APPROVED
                      </div>
                    </div>
                    
                    {/* Hand-lettered style caption summary */}
                    <div className="mt-4 text-center">
                      <p className="font-sans font-medium text-neutral-800 text-xs tracking-tight italic">
                        {caption}
                      </p>
                      
                      {/* Dotted separator reminiscent of nostalgic travel journals */}
                      <div className="flex items-center justify-between mt-3 px-1 text-[8px] font-mono text-neutral-400 uppercase tracking-widest border-t border-dotted border-neutral-300 pt-2.5">
                        <span>ESTD. 1986</span>
                        <span>MUMBAI, MH</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Value features checklists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04]">
            <Award className="w-6 h-6 text-[#c5a059] mb-3" />
            <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider mb-2">Multi-Point Certifications</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-light font-sans">
              We check the frame integrity for previous crash alignments, evaluate turbocharger pressure consistency, verify battery cold-crank amp levels, and review mechanical records to prevent odometer discrepancy issues.
            </p>
          </div>
          <div className="bg-[#1c1c1f] rounded-xl p-6 border border-white/[0.04]">
            <ShieldCheck className="w-6 h-6 text-[#c5a059] mb-3" />
            <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider mb-2">Legal Security Safeguards</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-light font-sans">
              All paperwork, registration certificates, transfer NOC documents, and active insurance transitions are structured in compliance with the Maharashtra RTO directives under professional dealership guidance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
