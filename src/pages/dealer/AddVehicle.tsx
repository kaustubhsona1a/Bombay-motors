/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicles } from '../../context/VehicleContext';
import { useToast } from '../../context/ToastContext';
import { compressImage, compressImageToBlob, enforceFirestoreSizeGuard } from '../../utils/imageCompressor';
import { ChevronLeft, Upload, X, Check, Eye, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { isFirebaseMock, uploadImageToStorage } from '../../firebase';

const COMMON_FEATURES = [
  'Panoramic Sunroof',
  'Burmester Premium Sound',
  'Ambient lighting (64 Colors)',
  'Airmatic Air Suspension',
  '360 Degree Surround Camera',
  'Ventilated Rear Seats',
  'Soft Close Doors',
  'Active Brake Assist',
  'Harman Kardon Audio',
  'Gesture Control',
  'Matrix LED lights',
  'M-Sport suspension Package'
];

export const AddVehicle: React.FC = () => {
  const { isAdmin } = useAuth();
  const { addVehicle } = useVehicles();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Gate
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/dealer-management');
    }
  }, [isAdmin, navigate]);

  // Form states
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState<number>(2021);
  const [fuelType, setFuelType] = useState<any>('Petrol');
  const [transmission, setTransmission] = useState<any>('Automatic');
  const [exteriorColor, setExteriorColor] = useState('');
  const [interiorColor, setInteriorColor] = useState('');
  const [price, setPrice] = useState<number>(20);
  const [mileage, setMileage] = useState<number>(15000);
  const [ownerCount, setOwnerCount] = useState<number>(1);
  const [registration, setRegistration] = useState('');
  const [description, setDescription] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [status, setStatus] = useState<any>('active');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (droppedIdx: number) => {
    if (draggedIdx === null || draggedIdx === droppedIdx) return;
    const reordered = [...images];
    const draggedItem = reordered[draggedIdx];
    reordered.splice(draggedIdx, 1);
    reordered.splice(droppedIdx, 0, draggedItem);
    setImages(reordered);
    setDraggedIdx(null);
  };

  const moveImageOrder = (index: number, direction: 'up' | 'down') => {
    const reordered = [...images];
    if (direction === 'up' && index > 0) {
      const temp = reordered[index];
      reordered[index] = reordered[index - 1];
      reordered[index - 1] = temp;
    } else if (direction === 'down' && index < reordered.length - 1) {
      const temp = reordered[index];
      reordered[index] = reordered[index + 1];
      reordered[index + 1] = temp;
    }
    setImages(reordered);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const item = reordered[index];
    reordered.splice(index, 1);
    reordered.unshift(item);
    setImages(reordered);
    showToast('Applied image as primary view.', 'success');
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setIsCompressing(true);
    const list: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        if (isFirebaseMock) {
          // Compress image for bandwidth and local Storage when offline
          const compressedB64 = await compressImage(file);
          list.push(compressedB64);
        } else {
          // Compress to lightweight JPEG blob first (takes <100ms) for instant uploads
          const optimizedBlob = await compressImageToBlob(file);
          const uniqueId = Math.random().toString(36).substr(2, 9);
          const storagePath = `vehicles/${Date.now()}_${uniqueId}.jpg`;
          const liveUrl = await uploadImageToStorage(optimizedBlob, storagePath);
          list.push(liveUrl);
        }
      } catch (err) {
        console.error(err);
        showToast('Processing or uploading image failed.', 'error');
      }
    }

    if (list.length > 0) {
      const merged = [...images, ...list];
      // Always enforce size guard to protect Firestore size limits, especially if using Base64 fallbacks
      const { optimizedImages } = enforceFirestoreSizeGuard(merged, 3500, (msg) => {
        showToast(msg, 'warning');
      });
      setImages(optimizedImages);
      
      const hasBase64 = optimizedImages.some(img => img.startsWith('data:image'));
      if (hasBase64) {
        showToast('Image(s) optimized locally for instant preview!', 'success');
      } else {
        showToast('Image(s) successfully hosted on Firebase Storage!', 'success');
      }
    }
    setIsCompressing(false);
  };

  const removeImage = (idxToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !variant || !registration) {
      showToast('Fulfill all asterisked required fields.', 'warning');
      return;
    }

    if (images.length === 0) {
      showToast('Please upload at least one showroom photograph.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const payloadRefId = await addVehicle({
        make,
        model,
        variant,
        year,
        fuelType,
        transmission,
        exteriorColor: exteriorColor || 'Standard Finish',
        interiorColor: interiorColor || 'Standard cabin finish',
        price,
        mileage,
        ownerCount,
        registration,
        description: description || `Pristine condition certified ${make} ${model}`,
        features: selectedFeatures.length ? selectedFeatures : ['Multi-Point Inspected', 'Airbags', 'ABS'],
        inspectionNotes: inspectionNotes || 'Multi-point inspection approved thoroughly',
        status,
        images,
        isFeatured: true
      });

      if (payloadRefId) {
        showToast('Luxury listing uploaded successfully inside warehouse.', 'success');
        navigate('/dealer-management/inventory');
      }
    } catch (err: any) {
      console.error('Error adding vehicle:', err);
      let errorMsg = 'Error uploading vehicle parameters.';
      if (err && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && typeof parsed === 'object' && parsed.error) {
            errorMsg = `Upload failed: ${parsed.error}`;
          } else {
            errorMsg = `Upload failed: ${err.message}`;
          }
        } catch {
          errorMsg = `Upload failed: ${err.message}`;
        }
      }
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            to="/dealer-management/inventory" 
            className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4 text-[#c5a059]" />
            Back to Warehouse
          </Link>
        </div>

        {/* Page title */}
        <div className="mb-10">
          <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">CATALOG SUBMISSION PORTAL</span>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white mt-1">LAUNCH NEW STOCK</h1>
        </div>

        {/* Unified Input grid */}
        <form onSubmit={handleSubmit} className="bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl flex flex-col gap-8">
          
          {/* Section 1: Specs */}
          <div>
            <h3 className="text-sm font-mono tracking-widest uppercase text-[#c5a059] border-b border-white/5 pb-2 mb-6">Section 1: Mechanical Spec List</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Make */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Mercedes-Benz"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Model Name *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. E-Class or 5 Series"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none w-full"
                />
              </div>

              {/* Variant */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Variant Code *</label>
                <input
                  type="text"
                  required
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="e.g. E 220d Exclusive"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Manufacturing Year *</label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2027"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Transmission */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest font-bold">Transmission *</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as any)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest font-bold">Fuel Engine *</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="CNG">CNG</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Showroom Valuations */}
          <div>
            <h3 className="text-sm font-mono tracking-widest uppercase text-[#c5a059] border-b border-white/5 pb-2 mb-6">Section 2: Showroom Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Selling Valuation Price (INR Lakh) *</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Mileage */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Mileage Driven (KM) *</label>
                <input
                  type="number"
                  required
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* RTO Registration */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Mumbai RTO Registration *</label>
                <input
                  type="text"
                  required
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="e.g. MH-02-FL-9911"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Owner count */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Owner Count *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="4"
                  value={ownerCount}
                  onChange={(e) => setOwnerCount(Number(e.target.value))}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Exterior Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Exterior Paint Finish</label>
                <input
                  type="text"
                  value={exteriorColor}
                  onChange={(e) => setExteriorColor(e.target.value)}
                  placeholder="e.g. Obsidian Black Metallic"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>

              {/* Interior Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest font-bold">Interior Cabin Finish</label>
                <input
                  type="text"
                  value={interiorColor}
                  onChange={(e) => setInteriorColor(e.target.value)}
                  placeholder="e.g. Macchiato Beige Leather"
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions & Reports */}
          <div>
            <h3 className="text-sm font-mono tracking-widest uppercase text-[#c5a059] border-b border-white/5 pb-2 mb-6">Section 3: Descriptions & Diagnostics</h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Showroom Editorial Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe overall conditions, full dealer service record listings, key features..."
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest">Bumper Inspection Diagnostics Report</label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Tyre thread remaining, diagnostic scanner reports, oil switches..."
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white resize-none"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#71717a] uppercase tracking-widest font-bold">Initial Listing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3 text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="active">Active Showcase</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Checklist Features */}
          <div>
            <h3 className="text-sm font-mono tracking-widest uppercase text-[#c5a059] border-b border-white/5 pb-2 mb-4">Section 4: Premium Integrations Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMMON_FEATURES.map((feat) => {
                const checked = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`p-3 border rounded-lg text-left text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                      checked 
                        ? 'border-[#c5a059] bg-[#c5a059]/5 text-white font-bold' 
                        : 'border-white/5 bg-[#1c1c1f] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{feat}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      checked ? 'bg-[#c5a059] border-[#c5a059] text-zinc-950' : 'border-zinc-700'
                    }`}>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Image upload */}
          <div>
            <h3 className="text-sm font-mono tracking-widest uppercase text-[#c5a059] border-b border-white/5 pb-2 mb-4">Section 5: Media Upload</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local File Selector */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/10 hover:border-[#c5a059]/40 bg-zinc-950/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
              >
                <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                <p className="text-xs text-zinc-300 font-sans font-semibold">Drop image files or browse files</p>
                <p className="text-[9px] text-[#71717a] font-mono mt-1">AUTO COMPRESSED TO 800PX KEY-LOG</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Paste Direct URL */}
              <div className="border border-white/5 bg-[#171719] p-5 rounded-2xl flex flex-col justify-center gap-3">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-[#c5a059]">Direct URL attachment</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal mt-1">If your images have issues uploading due to size constraints, paste direct image paths below (Unsplash, Imgur, CDN, etc.):</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-grow bg-zinc-900 border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!urlInput.trim()) return;
                      const trimmed = urlInput.trim();
                      if (!trimmed.toLowerCase().startsWith('http://') && !trimmed.toLowerCase().startsWith('https://')) {
                        showToast('Please insert a valid HTTP/HTTPS image URL.', 'warning');
                        return;
                      }
                      setImages((prev) => [...prev, trimmed]);
                      setUrlInput('');
                      showToast('Web image reference appended successfully.', 'success');
                    }}
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-750 border border-white/10 text-xs font-mono text-[#c5a059] uppercase rounded-xl transition-all hover:text-white"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>

            {isCompressing && (
              <div className="flex justify-center items-center gap-2 text-xs font-mono text-zinc-400 mt-4">
                <div className="w-4 h-4 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin shrink-0" />
                <span>{isFirebaseMock ? "Executing local HTML5 canvas compression..." : "Optimizing and uploading directly to Firebase Storage..."}</span>
              </div>
            )}

            {/* Preview images list */}
            {images.length > 0 && (
              <p className="text-[11px] text-zinc-400 font-sans mt-3 flex items-center gap-1.5">
                <span>💡</span> 
                <span>Drag and drop image cards to rearrange display order. The first image will be set as the <strong>Primary Image</strong>.</span>
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`relative aspect-video rounded-xl overflow-hidden border bg-zinc-950 cursor-grab active:cursor-grabbing transition-all duration-200 group ${
                    draggedIdx === idx 
                      ? 'border-[#c5a059] opacity-40 scale-95' 
                      : 'border-white/5 hover:border-[#c5a059]/40'
                  }`}
                >
                  <img src={img} alt="Showroom vehicle diagnostics preview" className="w-full h-full object-cover pointer-events-none select-none" />
                  
                  {/* Absolute top badge representing primary state */}
                  <div className="absolute top-2 left-2 z-10 flex gap-1.5 items-center">
                    {idx === 0 ? (
                      <span className="px-2 py-0.5 bg-[#c5a059] text-zinc-950 text-[8px] font-mono font-bold uppercase rounded flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Primary
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-900/80 text-zinc-400 text-[8px] font-mono uppercase rounded">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Right side close indicator */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-2 right-2 p-1 bg-zinc-950/80 hover:bg-red-950 hover:text-red-400 rounded-full text-zinc-400 transition-all cursor-pointer z-20"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Interactive Button Overlay (Visible on Hover/Focus) */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1.5 z-10">
                    <div className="flex items-center justify-between gap-1 w-full">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsPrimary(idx);
                          }}
                          className="flex-grow py-1 bg-[#c5a059]/90 hover:bg-[#c5a059] text-zinc-950 font-sans font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Star className="w-2.5 h-2.5 fill-current" /> Make Primary
                        </button>
                      )}
                      
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImageOrder(idx, 'up');
                          }}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-white cursor-pointer"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImageOrder(idx, 'down');
                          }}
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-white cursor-pointer"
                          title="Move Right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 p-4 border-t border-white/5 mt-4">
            <Link 
              to="/dealer-management/inventory"
              className="py-3 px-6 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white text-xs font-sans tracking-widest font-bold uppercase rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-8 bg-[#c5a059] text-[#09090b] text-xs font-sans tracking-widest font-bold uppercase rounded-xl hover:bg-[#b48a47] transition-all disabled:opacity-50 cursor-pointer outline-none"
            >
              {isSaving ? 'UPLOADING TO FIRESTORE...' : 'COMMIT METADATA LISTING'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
