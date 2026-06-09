/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Share2, 
  Calculator, 
  MessageCircle, 
  PhoneCall, 
  X, 
  Award,
  ChevronRight,
  Eye
} from 'lucide-react';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, addLead } = useVehicles();
  const { siteConfig } = useSiteConfig();
  const { showToast } = useToast();

  const vehicle = vehicles.find((v) => v.id === id);

  // States
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formContactMethod, setFormContactMethod] = useState<'WhatsApp' | 'Phone' | 'Email'>('WhatsApp');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EMI Configuration estimation helper
  const calculateEMI = (priceInLakhs: number) => {
    // Standard estimation: 5 years (60 months) tenor at 8.75% ROI.
    // EMI multiplier per lakh ≈ ₹2,060
    const estEmi = Math.round(priceInLakhs * 2060);
    return estEmi.toLocaleString('en-IN');
  };

  if (!vehicle) {
    return (
      <div className="bg-[#09090b] min-h-screen text-white flex flex-col justify-center items-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-[#c5a059] mb-4" />
        <h2 className="text-2xl font-sans font-bold uppercase tracking-wider">Automobile Not Found</h2>
        <p className="text-zinc-500 max-w-sm mt-2 text-sm leading-relaxed">
          The requested luxury listing may have been sold or archived by our showroom representatives.
        </p>
        <Link to="/inventory" className="text-xs font-mono font-bold tracking-widest text-[#c5a059] hover:underline mt-6 uppercase">
          Back to Inventory
        </Link>
      </div>
    );
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) {
      showToast('Please fulfill all required fields.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
        customerName: formName,
        customerEmail: formEmail,
        customerPhone: formPhone,
        type: 'BUY_INQUIRY',
        preferredContactMethod: formContactMethod,
        notes: formNotes || `Inquired for ${vehicle.make} ${vehicle.model}`
      });

      showToast(`Inquiry register submitted for ${vehicle.make}! An representative will verify.`, 'success');
      
      // Clear values
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormNotes('');
      setIsInquiryModalOpen(false);
    } catch {
      showToast('Failed to log inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bombay Motors - ${vehicle.make} ${vehicle.model}`,
        text: `Check out this pristine certified ${vehicle.make} at Bombay Motors.`,
        url: window.location.href,
      }).catch(err => console.log('Share canceled', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Showroom URL cloned to your clipboard!', 'success');
    }
  };

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-10 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link Nav block */}
        <div className="mb-6 flex justify-between items-center">
          <Link 
            to="/inventory" 
            className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4 text-[#c5a059]" />
            Back to Showroom
          </Link>
          <button 
            onClick={handleShare}
            className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> SHARE LISTING
          </button>
        </div>

        {/* Primary details structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN: VISUAL GALLERIES */}
          <div className="flex flex-col gap-4">
            
            {/* Main Stage Image */}
            <div className="relative w-full aspect-video md:aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 flex items-center justify-center">
              <img 
                src={vehicle.images[activeImgIdx] || 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200'} 
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-contain max-h-[80vh]"
              />
              <button 
                onClick={() => setIsFullscreenOpen(true)}
                className="absolute bottom-4 right-4 bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 px-3 py-2 rounded-lg flex items-center gap-1.5 text-xs font-mono uppercase text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#c5a059]" /> Magnify Mode
              </button>
              
              <div className="absolute top-4 left-4 bg-[#c5a059] text-[#09090b] px-3 py-1 rounded font-mono text-[10px] tracking-widest uppercase font-semibold">
                APPROVED SHOWROOM OUTLET
              </div>
            </div>

            {/* Thumbnails list slider */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {vehicle.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    idx === activeImgIdx ? 'border-[#c5a059] scale-[1.02]' : 'border-white/5 hover:border-zinc-500'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Inspection notes card */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 mt-4">
              <h3 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#c5a059]" /> BOMBAY APPROVED REPORT
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-light font-sans bg-zinc-950/40 p-4 rounded-lg border border-white/[0.02]">
                {vehicle.inspectionNotes || 'Professional certified inspection finalized. Steering, transmission control blocks, air filter arrays, suspension damping, and diagnostic codes tested thoroughly with zero warning states.'}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: TECHNICAL SPECS & SUMMARY */}
          <div className="flex flex-col">
            <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">{vehicle.year} OUTLET RELEASE</span>
            <h1 className="text-2xl md:text-4xl font-sans font-bold tracking-tight text-white mt-1 leading-none uppercase pr-8">
              {vehicle.make} <span className="text-zinc-400">{vehicle.model}</span>
            </h1>
            <p className="text-zinc-500 font-sans text-sm mt-2">{vehicle.variant}</p>

            <div className="flex items-baseline gap-4 mt-6">
              <span className="text-3xl font-mono font-medium text-[#c5a059]">₹{vehicle.price.toFixed(2)} Lakh</span>
              <span className="text-zinc-500 text-xs font-sans">(Negotiable on showroom table)</span>
            </div>

            {/* EMI estimation badge card */}
            <div className="bg-[#1c1c1f] rounded-xl p-4 md:p-5 border border-white/[0.04] mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-[#c5a059]" />
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">ESTIMATED EASY EMI</h4>
                  <p className="text-sm md:text-base font-mono font-normal text-[#f4f4f5] mt-0.5">₹{calculateEMI(vehicle.price)} / Month</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-black/30 px-2 py-1 rounded border border-white/[0.02]">8.75% ROI • 5 Yr Tenor</span>
            </div>

            <hr className="border-white/5 my-6" />

            {/* Description */}
            <h3 className="font-sans font-semibold text-white text-xs uppercase tracking-widest mb-3 text-zinc-400">ABOUT THE VEHICLE</h3>
            <p className="text-zinc-300 text-sm leading-relaxed font-normal mb-8 font-sans">
              {vehicle.description}
            </p>

            {/* Float Booking button */}
            <button 
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full text-center py-4 bg-[#c5a059] text-[#09090b] hover:bg-[#b48a47] font-medium text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#c5a059]/5 hover:shadow-[#c5a059]/10 flex items-center justify-center gap-2 cursor-pointer outline-none"
            >
              <PhoneCall className="w-4 h-4 shrink-0" /> Enquiry About This Vehicle
            </button>
          </div>
        </div>

        {/* Full width technical specifications block */}
        <hr className="border-white/5 my-12" />

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-3.5 bg-[#c5a059] rounded-sm" />
            <h3 className="font-sans font-medium text-white text-xs uppercase tracking-widest">
              Technical Specifications Overview
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-sans">
            <div className="bg-[#121214]/60 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Mileage</span>
              <p className="text-[#f4f4f5] font-sans font-normal text-base mt-2">{vehicle.mileage.toLocaleString()} KM</p>
            </div>
            
            <div className="bg-[#121214]/60 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Fuel Engine</span>
              <p className="text-[#f4f4f5] font-sans font-normal text-base mt-2">{vehicle.fuelType}</p>
            </div>
            
            <div className="bg-[#121214]/60 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Transmission</span>
              <p className="text-[#f4f4f5] font-sans font-normal text-base mt-2">{vehicle.transmission}</p>
            </div>
            
            <div className="bg-[#121214]/60 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Registration</span>
              <p className="text-[#f4f4f5] font-sans font-normal text-base mt-2">{vehicle.registration}</p>
            </div>
            
            <div className="bg-[#121214]/60 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Exterior Finish</span>
              <p className="text-[#f4f4f5] font-sans font-normal text-base mt-2">{vehicle.exteriorColor}</p>
            </div>
            
            <div className="bg-[#121214]/60 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[90px]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Interior Cabin</span>
              <p className="text-[#f4f4f5] font-sans font-normal text-base mt-2">{vehicle.interiorColor}</p>
            </div>
          </div>
        </div>

        {/* Showroom certified integrations block */}
        <div className="mt-10 bg-[#121214]/40 border border-white/[0.02] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5 text-[#c5a059]" />
            <h3 className="font-sans font-normal text-white text-xs uppercase tracking-widest">
              Showroom Certified Integrations
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {vehicle.features.map((feat, idx) => (
              <span 
                key={idx} 
                className="bg-black/35 text-zinc-350 px-4 py-2 border border-white/[0.04] text-xs rounded-full flex items-center gap-2 font-sans hover:border-[#c5a059]/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* 3. MULTI-IMAGE FULL SCREEN BOX (Fullscreen Mode) */}
        <AnimatePresence>
          {isFullscreenOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#09090b]/98 backdrop-blur-lg flex flex-col justify-between p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center text-white border-b border-white/5 pb-4">
                <span className="font-mono text-xs tracking-widest uppercase"> {vehicle.year} {vehicle.make} {vehicle.model} </span>
                <button 
                  onClick={() => setIsFullscreenOpen(false)}
                  className="p-1 px-3 border border-white/10 hover:border-white/30 rounded-lg text-xs font-mono uppercase transition-colors"
                >
                  CLOSE [X]
                </button>
              </div>

              {/* Main Image Slider */}
              <div className="flex-1 flex justify-between items-center relative py-12 max-w-5xl mx-auto w-full">
                
                {/* Previous */}
                <button
                  onClick={() => setActiveImgIdx(prev => prev === 0 ? vehicle.images.length - 1 : prev - 1)}
                  className="p-3 bg-zinc-900 border border-white/10 hover:border-[#c5a059] rounded-full text-white cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {/* Image Stage */}
                <img 
                  src={vehicle.images[activeImgIdx]} 
                  alt="Scenic view magnify" 
                  className="max-h-[65vh] object-contain rounded-xl select-none"
                />

                {/* Next */}
                <button
                  onClick={() => setActiveImgIdx(prev => prev === vehicle.images.length - 1 ? 0 : prev + 1)}
                  className="p-3 bg-zinc-900 border border-white/10 hover:border-[#c5a059] rounded-full text-white cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Slider thumbs bottom row */}
              <div className="flex justify-center gap-2 overflow-x-auto py-4">
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-16 h-12 rounded-md overflow-hidden border ${idx === activeImgIdx ? 'border-[#c5a059]' : 'border-white/5'}`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. MODAL FOR INQUIRY FORM */}
        <AnimatePresence>
          {isInquiryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Blur Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
              />

              {/* Content Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-lg bg-[#121214] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#c5a059] font-mono text-[10px] tracking-widest uppercase">SHOWROOM CALLBACK REGISTER</span>
                    <h2 className="text-xl font-sans font-bold text-white uppercase mt-0.5 leading-none">VEHICLE INQUIRY</h2>
                  </div>
                  <button 
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="p-1 px-2 border border-white/5 hover:border-white/20 rounded text-[#71717a] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-zinc-950 border border-white/[0.02] rounded-xl flex items-center gap-3">
                  <img src={vehicle.images[0]} alt="Showroom car thumbnail" className="w-16 aspect-video object-cover rounded-md" />
                  <div>
                    <h4 className="text-xs font-sans font-bold text-white uppercase">{vehicle.make} {vehicle.model}</h4>
                    <span className="text-[10px] font-mono text-[#c5a059]">{vehicle.year} • ₹{vehicle.price.toFixed(2)} Lakh</span>
                  </div>
                </div>

                <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4 font-sans text-sm">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Anil K. Ambani"
                      className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-[#c5a059]/40 rounded-lg p-3 text-white outline-none font-sans"
                    />
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="customer@mumbai.in"
                        className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-[#c5a059]/40 rounded-lg p-3 text-white outline-none font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 98200 12345"
                        className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-[#c5a059]/40 rounded-lg p-3 text-white outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Reach preferences */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Preferred Reach Pathway</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['WhatsApp', 'Phone', 'Email'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormContactMethod(method)}
                          className={`py-2 px-3 border rounded-lg text-xs font-sans transition-all cursor-pointer ${
                            formContactMethod === method
                              ? 'border-[#c5a059] bg-[#c5a059]/5 text-[#c5a059]'
                              : 'border-white/5 bg-zinc-950 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Extra Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Requirement Notes</label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. Schedule checking schedule, request final on-table price quote, trade-in enquiry..."
                      className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-[#c5a059]/40 rounded-lg p-3 text-white resize-none outline-none font-sans text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-center py-3 bg-[#c5a059] text-[#09090b] hover:bg-[#b48a47] font-semibold text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? 'PROCESSING SECURE UPLOAD...' : 'SUBMIT SHOWROOM REGISTRATION'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
