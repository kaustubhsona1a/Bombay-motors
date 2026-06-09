/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useVehicles } from '../../context/VehicleContext';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, ChevronRight, Save, MapPin, Phone, MessageSquare, Clock, Globe, Instagram, Upload, X, Image as ImageIcon, ArrowLeft, ArrowRight, Database, Copy, Check, CheckCircle2, RefreshCw, HelpCircle } from 'lucide-react';
import { compressImage, compressImageToBlob } from '../../utils/imageCompressor';
import { isFirebaseMock, dataURLtoBlob, uploadImageToStorage } from '../../firebase';

interface VisualImageUploaderProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isCompressing: boolean;
  onUploadClick: () => void;
}

const VisualImageUploader: React.FC<VisualImageUploaderProps> = ({ 
  label, 
  value, 
  onChange, 
  fileInputRef, 
  isCompressing, 
  onUploadClick 
}) => {
  const [showInput, setShowInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        // Create a new DataTransfer object to assign files to hidden input element
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(e.dataTransfer.files[0]);
        fileInputRef.current.files = dataTransfer.files;
        // Dispatch synthetic change event
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };
  
  return (
    <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono uppercase tracking-widest text-[#c5a059] font-bold">{label}</span>
        <button
          type="button"
          onClick={() => setShowInput(!showInput)}
          className="text-[10px] font-mono text-zinc-500 hover:text-[#c5a059] transition-all cursor-pointer underline"
        >
          {showInput ? 'Hide Link Field' : 'Set Direct URL Link'}
        </button>
      </div>

      {/* Visual Preview Box with Drag & Drop support */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!value ? onUploadClick : undefined}
        className={`relative aspect-video rounded-xl overflow-hidden border transition-all duration-300 bg-zinc-950 flex flex-col items-center justify-center group ${
          !value ? 'cursor-pointer' : ''
        } ${
          isDragOver 
            ? 'border-[#c5a059] bg-[#c5a059]/5' 
            : !value 
              ? 'border-white/5 hover:border-[#c5a059]/35 hover:bg-white/[0.01]' 
              : 'border-white/5'
        }`}
      >
        {value ? (
          <>
            <img 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onUploadClick}
                className="px-3.5 py-2 bg-[#c5a059] hover:bg-[#b48a47] text-zinc-950 text-[10px] font-mono uppercase tracking-widest rounded-lg font-bold cursor-pointer transition-colors"
              >
                Upload New Image
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900/80 text-white text-[10px] font-mono uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
              >
                Clear
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 flex flex-col items-center pointer-events-none">
            <ImageIcon className="w-8 h-8 text-zinc-700 group-hover:text-[#c5a059]/60 transition-colors mb-2" />
            <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-widest block font-medium">
              Click or Drag & Drop to Upload
            </span>
            <span className="text-[9px] text-zinc-650 font-mono mt-1">Image files up to 10MB</span>
          </div>
        )}

        {/* Loading state bar */}
        {isCompressing && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center z-20">
            <div className="w-6 h-6 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin mb-2" />
            <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-widest">Optimizing & Uploading...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUploadClick}
          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl text-xs text-[#c5a059] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold"
        >
          <Upload className="w-3.5 h-3.5" />
          {isCompressing ? 'Uploading Device File...' : 'Upload Image File'}
        </button>
      </div>

      {/* Slide-out/Toggle raw text box if they want to override directly */}
      {showInput && (
        <div className="relative mt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste direct Unsplash or web HTTPS image URL here..."
            className="w-full bg-zinc-950 border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-[11px] text-white font-mono placeholder-zinc-600 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};

export const SettingsPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const { siteConfig, updateSiteConfig, isLoading } = useSiteConfig();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Settings values
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [googleRating, setGoogleRating] = useState(4.3);
  const [reviewsCount, setReviewsCount] = useState(109);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState('');

  // Custom section backgrounds
  const [heroBanner, setHeroBanner] = useState('');
  const [sellSectionBg, setSellSectionBg] = useState('');
  const [testimonialsBg, setTestimonialsBg] = useState('');
  const [showroomBg, setShowroomBg] = useState('');
  const [aboutSectionPhoto, setAboutSectionPhoto] = useState('');
  const [aboutSubtitle, setAboutSubtitle] = useState('');
  const [aboutHeroTitle, setAboutHeroTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutStory, setAboutStory] = useState('');
  const [happyCustomersStr, setHappyCustomersStr] = useState('');

  // Refs for local device photo uploading
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const sellFileInputRef = useRef<HTMLInputElement>(null);
  const testimonialsFileInputRef = useRef<HTMLInputElement>(null);
  const showroomFileInputRef = useRef<HTMLInputElement>(null);
  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const happyCustomersInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Compressing statuses
  const [isHeroCompressing, setIsHeroCompressing] = useState(false);
  const [isSellCompressing, setIsSellCompressing] = useState(false);
  const [isTestimonialsCompressing, setIsTestimonialsCompressing] = useState(false);
  const [isShowroomCompressing, setIsShowroomCompressing] = useState(false);
  const [isAboutCompressing, setIsAboutCompressing] = useState(false);
  const [isHappyCompressing, setIsHappyCompressing] = useState(false);
  const [isLogoCompressing, setIsLogoCompressing] = useState(false);

  // Helper function to handle a singular image selector click converting to compressed base64 or Firebase Storage URL
  const handleSingleImageUpload = async (
    files: FileList | null, 
    setTargetUrl: (url: string) => void, 
    setIsCompressing: (c: boolean) => void,
    maxDim = 1600,
    quality = 0.70
  ) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Only image files can be selected.', 'warning');
      return;
    }
    setIsCompressing(true);
    try {
      if (isFirebaseMock) {
        const b64 = await compressImage(file, maxDim, quality);
        setTargetUrl(b64);
        showToast('Photo uploaded from local device and compressed successfully!', 'success');
      } else {
        // Compress to a highly efficient blob limit of 1600px quality 0.7
        const optimizedBlob = await compressImageToBlob(file, maxDim, quality);
        const uniqueId = Math.random().toString(36).substr(2, 9);
        const name = `site_assets/${Date.now()}__${uniqueId}.jpg`;
        const liveUrl = await uploadImageToStorage(optimizedBlob, name);
        setTargetUrl(liveUrl);
        if (liveUrl.startsWith('data:image')) {
          showToast('Photo optimized locally for instant preview!', 'success');
        } else {
          showToast('Photo uploaded to Firebase Storage and applied to layout!', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to process image file.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  // Helper function to handle multiple happy customer uploads directly to Firebase Storage
  const handleMultipleHappyCustomers = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsHappyCompressing(true);
    const existing = happyCustomersStr.split('\n').map(u => u.trim()).filter(Boolean);
    const list: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        if (isFirebaseMock) {
          const b64 = await compressImage(file);
          list.push(b64);
        } else {
          // Compress to efficient blob to prevent oversize on Base64 fallback (max 800px quality 0.5)
          const optimizedBlob = await compressImageToBlob(file, 800, 0.5);
          const uniqueId = Math.random().toString(36).substr(2, 9);
          const name = `site_assets/happy_${Date.now()}_${uniqueId}.jpg`;
          const liveUrl = await uploadImageToStorage(optimizedBlob, name);
          list.push(liveUrl);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (list.length > 0) {
      const combined = [...existing, ...list];
      setHappyCustomersStr(combined.join('\n'));
      
      const containsBase64 = list.some(url => url.startsWith('data:image'));
      if (containsBase64) {
        showToast(`${list.length} photo(s) optimized locally and added to gallery!`, 'success');
      } else {
        showToast(`${list.length} photo(s) hosted on Firebase Storage and added to gallery!`, 'success');
      }
    }
    setIsHappyCompressing(false);
  };

  const moveHappyCustomer = (index: number, direction: 'up' | 'down') => {
    const urls = happyCustomersStr.split('\n').map(l => l.trim()).filter(Boolean);
    if (direction === 'up' && index > 0) {
      const temp = urls[index];
      urls[index] = urls[index - 1];
      urls[index - 1] = temp;
    } else if (direction === 'down' && index < urls.length - 1) {
      const temp = urls[index];
      urls[index] = urls[index + 1];
      urls[index + 1] = temp;
    }
    setHappyCustomersStr(urls.join('\n'));
    showToast('Handover photo order updated.', 'success');
  };

  const removeHappyCustomer = (index: number) => {
    const urls = happyCustomersStr.split('\n').map(l => l.trim()).filter(Boolean);
    urls.splice(index, 1);
    setHappyCustomersStr(urls.join('\n'));
    showToast('Handover photo deleted.', 'info');
  };

  // Security gate
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dealer-management');
    }
  }, [isAdmin, navigate]);

  // Load current values
  useEffect(() => {
    if (siteConfig) {
      setAddress(siteConfig.address);
      setPhone(siteConfig.phone);
      setWhatsApp(siteConfig.whatsApp || '');
      setInstagram(siteConfig.instagram || '');
      setLogoUrl(siteConfig.logoUrl || '');
      setBusinessHours(siteConfig.businessHours);
      setGoogleRating(siteConfig.googleRating || 4.3);
      setReviewsCount(siteConfig.reviewsCount || 109);
      setGoogleMapsUrl(siteConfig.googleMapsUrl || '');
      setGoogleReviewsUrl(siteConfig.googleReviewsUrl || '');
      setHeroBanner(siteConfig.heroBanner || '');
      setSellSectionBg(siteConfig.sellSectionBg || '');
      setTestimonialsBg(siteConfig.testimonialsBg || '');
      setShowroomBg(siteConfig.showroomBg || '');
      setAboutSectionPhoto(siteConfig.aboutSectionPhoto || '');
      setAboutSubtitle(siteConfig.aboutSubtitle || '');
      setAboutHeroTitle(siteConfig.aboutHeroTitle || '');
      setAboutDescription(siteConfig.aboutDescription || '');
      setAboutStory(siteConfig.aboutStory || '');
      setHappyCustomersStr((siteConfig.happyCustomers || []).join('\n'));
    }
  }, [siteConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone || !whatsApp || !businessHours) {
      showToast('All fields are required.', 'warning');
      return;
    }

    try {
      await updateSiteConfig({
        address,
        phone,
        whatsApp,
        instagram,
        logoUrl,
        businessHours,
        googleRating,
        reviewsCount,
        googleMapsUrl,
        googleReviewsUrl,
        heroBanner,
        sellSectionBg,
        testimonialsBg,
        showroomBg,
        aboutSectionPhoto,
        aboutSubtitle,
        aboutHeroTitle,
        aboutDescription,
        aboutStory,
        happyCustomers: happyCustomersStr.split('\n').map(u => u.trim()).filter(Boolean)
      });
      showToast('Showroom parameters and background image catalog refreshed!', 'success');
    } catch {
      showToast('Operational parameters update error.', 'error');
    }
  };

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-10 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/dealer-management" 
            className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4 text-[#c5a059]" />
            Back to Cockpit
          </Link>
        </div>

        {/* Page Titles */}
        <div className="mb-10 font-sans">
          <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">VITALS ADJUSTMENT DRAWER</span>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white mt-1 leading-none">
            SHOWROOM CONFIGURATIONS
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure dealership address coordinates, interactive WhatsApp targets, business timings and SEO parameters.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 bg-[#121214] border border-white/5 rounded-2xl">
            <div className="w-8 h-8 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-zinc-500">Retrieving operational parameters...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl flex flex-col gap-8">
            
            {/* Showroom Brand Logo */}
            <div className="border-b border-white/5 pb-8">
              <h3 className="text-sm font-mono tracking-wider uppercase text-[#c5a059] mb-1">Showroom Brand Logo</h3>
              <p className="text-[11px] text-zinc-500 mb-4">
                Upload your brand logo (transparent image or simple layout recommended). This will replace the default "BM" monogram icon and display next to BOMBAY MOTORS in the header navbar.
              </p>
              
              <div className="max-w-md">
                <VisualImageUploader
                  label="Showroom Brand Logo"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  fileInputRef={logoFileInputRef}
                  isCompressing={isLogoCompressing}
                  onUploadClick={() => logoFileInputRef.current?.click()}
                />
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e.target.files, setLogoUrl, setIsLogoCompressing)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5" /> Physical Showroom Address
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white resize-none"
              />
            </div>

            {/* Direct Lines Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                  <Phone className="w-4.5 h-4.5" /> Showroom Desk Line
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-500" /> WhatsApp Direct CTA
                </label>
                <input
                  type="text"
                  required
                  value={whatsApp}
                  onChange={(e) => setWhatsApp(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                  <Instagram className="w-4.5 h-4.5 text-pink-500" /> Instagram Handle
                </label>
                <input
                  type="text"
                  required
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white font-mono"
                  placeholder="e.g. bombaymotorss"
                />
              </div>

            </div>

            {/* Business hours and metadata reviews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5" /> Operational Hours
                </label>
                <input
                  type="text"
                  required
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-[#f4f4f5] font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  Google Feed Rating (out of 5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  required
                  value={googleRating}
                  onChange={(e) => setGoogleRating(Number(e.target.value))}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-[#f4f4f5] font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  Google Feed Reviews Count
                </label>
                <input
                  type="number"
                  required
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(Number(e.target.value))}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-[#f4f4f5] font-mono"
                />
              </div>

            </div>

            {/* Google Integrations section */}
            <div className="border-t border-white/5 pt-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-mono tracking-wider uppercase text-[#c5a059] mb-1">Google Maps & Reviews Links</h3>
                <p className="text-[11px] text-zinc-500">Configure public URLs linking to your Google Maps listing and direct review portal.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Google Maps Search / Coordinates Link
                  </label>
                  <input
                    type="text"
                    required
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/..."
                    className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Google Reviews Redirection Link
                  </label>
                  <input
                    type="text"
                    required
                    value={googleReviewsUrl}
                    onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/place/..."
                    className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Custom Background Images Section */}
            <div className="border-t border-white/5 pt-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-mono tracking-wider uppercase text-[#c5a059] mb-1">Hero Section Banner</h3>
                <p className="text-[11px] text-zinc-500">Provide a direct web image path or upload directly from your local device to customize the main home page showcase vehicle background.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hero section */}
                <VisualImageUploader
                  label="Hero Section Banner (Home)"
                  value={heroBanner}
                  onChange={setHeroBanner}
                  fileInputRef={heroFileInputRef}
                  isCompressing={isHeroCompressing}
                  onUploadClick={() => heroFileInputRef.current?.click()}
                />
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSingleImageUpload(e.target.files, setHeroBanner, setIsHeroCompressing)}
                  className="hidden"
                />

              </div>
            </div>

            {/* Custom About Page Media Section */}
            <div className="border-t border-white/5 pt-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-mono tracking-wider uppercase text-[#c5a059] mb-1">About Us Page & Happy Deliveries</h3>
                <p className="text-[11px] text-zinc-500">Configure the copy, description, bio photo, and happy customer handover galleries shown on the site.</p>
              </div>

              <div className="flex flex-col gap-6">

                {/* About titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      About Us Short Subtitle
                    </label>
                    <input
                      type="text"
                      value={aboutSubtitle}
                      onChange={(e) => setAboutSubtitle(e.target.value)}
                      placeholder="e.g. Mumbai's highly trusted destination for certified, high-quality family hatchbacks..."
                      className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-xs text-white font-sans focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      About Us Hero Title
                    </label>
                    <input
                      type="text"
                      value={aboutHeroTitle}
                      onChange={(e) => setAboutHeroTitle(e.target.value)}
                      placeholder="e.g. YOUR FAMILY’S SAFEST & MOST RELIABLE DRIVE RUNS HERE"
                      className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-xs text-white font-sans font-bold focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* About primary narration */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Primary Biography / Narration (Used Family Car dealer focus)
                  </label>
                  <textarea
                    rows={4}
                    value={aboutDescription}
                    onChange={(e) => setAboutDescription(e.target.value)}
                    placeholder="Provide your dealership check guarantees, customer service story, focus on trust and safety..."
                    className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-xs text-white font-sans leading-relaxed focus:outline-none"
                  />
                </div>

                {/* About side quote story */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Quote Highlight Box (Focus on hassle-free values)
                  </label>
                  <textarea
                    rows={3}
                    value={aboutStory}
                    onChange={(e) => setAboutStory(e.target.value)}
                    placeholder="Describe your 100% paperless transfer service, RTO speed, RTO approvals, zero hassle..."
                    className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-xs text-white font-sans leading-relaxed focus:outline-none"
                  />
                </div>
                
                {/* Visual Bio Photo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      About Page Representative Main Photo
                    </label>
                    <VisualImageUploader
                      label="Biography Section Focus Photo"
                      value={aboutSectionPhoto}
                      onChange={setAboutSectionPhoto}
                      fileInputRef={aboutPhotoInputRef}
                      isCompressing={isAboutCompressing}
                      onUploadClick={() => aboutPhotoInputRef.current?.click()}
                    />
                    <input
                      ref={aboutPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSingleImageUpload(e.target.files, setAboutSectionPhoto, setIsAboutCompressing)}
                      className="hidden"
                    />
                  </div>

                  {/* Happy Deliveries Unified Visual Card list */}
                  <div className="flex flex-col gap-3 bg-[#121214] border border-white/5 rounded-2xl p-5">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono uppercase font-bold text-[#c5a059]">HAPPY Handovers GALLERY</span>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('happy-raw-textarea-toggle');
                            if (el) el.classList.toggle('hidden');
                          }}
                          className="text-[9px] font-mono text-zinc-500 hover:text-[#c5a059] underline cursor-pointer"
                        >
                          Paste URL List
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 pb-2">
                        Deliveries are ordered below. The primary (first) image will show as the featured delivery.
                      </p>
                    </div>

                    {/* Interactive Handover Photo Grid */}
                    <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1 bg-zinc-950/40 border border-white/[0.02] p-3 rounded-xl min-h-[100px]">
                      {happyCustomersStr.split('\n').map((u) => u.trim()).filter(Boolean).length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-zinc-650 flex flex-col items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-zinc-850 mb-1" />
                          <span className="text-[9px] font-mono uppercase tracking-widest">No deliveries added</span>
                        </div>
                      ) : (
                        happyCustomersStr.split('\n').map((url, idx, arr) => (
                          <div key={idx} className="relative aspect-square bg-[#1a1a1c] border border-white/5 rounded-lg overflow-hidden group">
                            <img 
                              src={url} 
                              alt="Handover custom delivery" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Primary badge for index 0 */}
                            {idx === 0 && (
                              <div className="absolute top-1 left-1 px-1 py-0.5 bg-[#c5a059] text-zinc-950 text-[7px] font-mono font-bold rounded uppercase animate-pulse animate-none">
                                Primary
                              </div>
                            )}

                            {/* Hover overlay navigation & delete controls */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-10">
                              {/* Top delete action */}
                              <div className="flex justify-between items-start">
                                <span className="text-[7px] font-mono text-zinc-400">#{idx+1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeHappyCustomer(idx)}
                                  className="p-0.5 bg-red-950/80 hover:bg-red-900 rounded text-red-400 cursor-pointer animate-none"
                                  title="Delete image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Bottom sequence trigger flags */}
                              <div className="flex justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveHappyCustomer(idx, 'up')}
                                  className="p-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-white cursor-pointer"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === arr.length - 1}
                                  onClick={() => moveHappyCustomer(idx, 'down')}
                                  className="p-1 bg-zinc-800 hover:bg-zinc-755 disabled:opacity-30 rounded text-white cursor-pointer"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Hidden-by-default textarea override panel if they need manual text entry */}
                    <div id="happy-raw-textarea-toggle" className="hidden transition-all duration-300">
                      <textarea
                        rows={3}
                        value={happyCustomersStr}
                        onChange={(e) => setHappyCustomersStr(e.target.value)}
                        placeholder="Paste list here (one HTTPS image URL per line)..."
                        className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-2.5 text-[10px] text-white font-mono leading-relaxed"
                      />
                    </div>

                    {/* Simple, clear action drawers */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => happyCustomersInputRef.current?.click()}
                        className="w-full py-2.5 bg-[#c5a059] hover:bg-[#b48a47] text-zinc-950 font-sans font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                      >
                        <Upload className="w-4 h-4" />
                        {isHappyCompressing ? 'Uploading...' : 'Upload Handovers'}
                      </button>
                      
                      {happyCustomersStr.split('\n').filter(Boolean).length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Clear all gallery handovers?')) {
                              setHappyCustomersStr('');
                              showToast('Gallery cleared', 'info');
                            }
                          }}
                          className="px-3 bg-red-950/25 hover:bg-red-950/40 border border-red-900/10 text-red-400 rounded-xl cursor-pointer"
                          title="Clear Gallery"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <input
                        ref={happyCustomersInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleMultipleHappyCustomers(e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#c5a059] text-zinc-950 font-sans font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#b48a47] transition-all flex items-center gap-1.5 cursor-pointer outline-none"
              >
                <Save className="w-4.5 h-4.5" /> Save Showroom Configuration
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
