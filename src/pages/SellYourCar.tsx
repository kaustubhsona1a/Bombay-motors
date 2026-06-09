/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { compressImage, compressImageToBlob, enforceFirestoreSizeGuard } from '../utils/imageCompressor';
import { motion, AnimatePresence } from 'motion/react';
import { isFirebaseMock, uploadImageToStorage } from '../firebase';
import { 
  Car, 
  Upload, 
  FileText, 
  User, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Coins, 
  Gauge, 
  Calendar 
} from 'lucide-react';

export const SellYourCar: React.FC = () => {
  const { addLead } = useVehicles();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 1: VEHICLE DETAILS STATES
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2020);
  const [mileage, setMileage] = useState<number>(30000);
  const [ownership, setOwnership] = useState<number>(1);
  const [expectedPrice, setExpectedPrice] = useState<number>(15); // In Lakhs

  // STEP 2: PHOTO STATES
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // STEP 3: CUSTOMER CONTACT STATES
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [formContactMethod, setFormContactMethod] = useState<'WhatsApp' | 'Phone' | 'Email'>('WhatsApp');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image drag & drop and click upload
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files) return;

    setIsCompressing(true);
    const compressedList: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
       try {
         const file = files[i];
         if (!file.type.startsWith('image/')) {
           showToast(`File "${file.name}" is not an image.`, 'warning');
           continue;
         }

         if (isFirebaseMock) {
           // Compress via Canvas as per specifications
           const compressedBase64 = await compressImage(file);
           compressedList.push(compressedBase64);
         } else {
           // Compress to lightweight JPEG blob first (takes <100ms) for instant uploads to Firebase Storage
           const optimizedBlob = await compressImageToBlob(file);
           const uniqueId = Math.random().toString(36).substr(2, 9);
           const storagePath = `customer_vehicles/${Date.now()}_${uniqueId}.jpg`;
           const liveUrl = await uploadImageToStorage(optimizedBlob, storagePath);
           compressedList.push(liveUrl);
         }
       } catch (err) {
         console.error('Compression or upload error:', err);
         showToast('Image processing or uploading failed.', 'error');
       }
    }

    if (compressedList.length > 0) {
      const mergedImages = [...images, ...compressedList];

      // Always enforce final size guard to protect Firestore document size limits in case of Base64 fallbacks
      const { optimizedImages } = enforceFirestoreSizeGuard(mergedImages, 3000, (msg) => {
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

  const removePhoto = (idxToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!make || !model || !year || !mileage || !expectedPrice) {
        showToast('Please fulfill all vehicle fields.', 'warning');
        return;
      }
    }
    if (currentStep === 2) {
      if (images.length === 0) {
        showToast('Please upload at least 1 primary photograph of your vehicle.', 'info');
        return;
      }
    }
    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail || !custPhone) {
      showToast('Please fulfill all contact details.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate final document sizes
      const baseEstimate = 3000;
      const { optimizedImages } = enforceFirestoreSizeGuard(images, baseEstimate, (msg) => {
        showToast(msg, 'warning');
      });

      // Submit lead with expectedPrice and sellCarDetails
      await addLead({
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: custPhone,
        type: 'SELL_INQUIRY',
        preferredContactMethod: formContactMethod,
        notes: custNotes || `Selling assessment requested for ${year} ${make} ${model}`,
        expectedPrice: expectedPrice,
        sellCarDetails: {
          make,
          model,
          year,
          mileage,
          ownership
        },
        vehicleId: null, // No primary vehicle associated as this is a new vehicle they are selling
        vehicleName: `${year} ${make} ${model}`
      });

      showToast('Auto valuation evaluation log created successfully!', 'success');

      // Reset form variables
      setMake('');
      setModel('');
      setYear(2020);
      setMileage(30000);
      setOwnership(1);
      setExpectedPrice(15);
      setImages([]);
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setCustNotes('');
      setCurrentStep(1);
    } catch {
      showToast('Validation logic failed. Check fields.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'AUTOMOBILE SPECS', icon: Car },
    { num: 2, label: 'UPLOAD PHOTOGRAPHS', icon: Upload },
    { num: 3, label: 'CONTACT INFO', icon: User }
  ];

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-16 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Page Titles */}
        <div className="text-center mb-12">
          <span className="text-[#c5a059] font-mono text-xs tracking-[0.25em] uppercase">AUTO EVALUATION MATRIX</span>
          <h1 className="text-3xl md:text-5xl font-sans font-bold text-white uppercase tracking-tight mt-1 leading-none">
            SELL YOUR LUXURY CAR
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto leading-relaxed">
            Submit your car details to our appraisal desks opposing Santoshimata Mandir West. Get an instant, competitive, premium checkout trade offer.
          </p>
        </div>

        {/* STEP METRIC PIPELINES */}
        <div className="flex justify-between items-center bg-[#121214] border border-white/5 rounded-xl p-4 md:p-6 mb-10 overflow-x-auto gap-4">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} className="flex-1 flex items-center gap-3 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-colors ${
                  isCompleted 
                    ? 'bg-[#c5a059] border-[#c5a059] text-zinc-950'
                    : isCurrent
                    ? 'border-[#c5a059] text-[#c5a059]'
                    : 'border-white/5 text-zinc-600'
                }`}>
                  {isCompleted ? <Check className="w-4.5 h-4.5" /> : st.num}
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-mono uppercase tracking-widest font-bold leading-none ${
                    isCurrent ? 'text-white' : 'text-zinc-600'
                  }`}>
                    {st.label}
                  </span>
                </div>
                {idx !== steps.length - 1 && <div className="hidden md:block w-8 h-0.5 bg-zinc-800" />}
              </div>
            );
          })}
        </div>

        {/* WIZARD CONTENT BOX CARD */}
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a059]/20 via-[#c5a059] to-[#c5a059]/20" />
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1 FORM PANEL */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <h3 className="font-sans font-bold text-lg text-white uppercase tracking-wider border-b border-white/5 pb-3">
                  Vehicle Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Make */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Manufacturer / Brand *</label>
                    <input
                      type="text"
                      required
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Mercedes-Benz, BMW, Porsche"
                      className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Model */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Model & Variant Name *</label>
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. C-Class C200 Progressive"
                      className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Year */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Manufacturing Year *</label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2027"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 pl-12 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Mileage */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Mileage driven (in KM) *</label>
                    <div className="relative">
                      <Gauge className="w-5 h-5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        required
                        min="0"
                        value={mileage}
                        onChange={(e) => setMileage(Number(e.target.value))}
                        className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 pl-12 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Ownership */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Ownership Count *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setOwnership(num)}
                          className={`py-3 px-4 border rounded-xl text-xs font-mono transition-all font-bold cursor-pointer ${
                            ownership === num
                              ? 'border-[#c5a059] bg-[#c5a059]/5 text-[#c5a059]'
                              : 'border-white/5 bg-[#1c1c1f] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {num === 1 ? '1st Owner' : num === 2 ? '2nd Owner' : `${num}rd Owner`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expected pricing */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Your Asking Price (INR Lakh) *</label>
                    <div className="relative">
                      <Coins className="w-5 h-5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.5"
                        value={expectedPrice}
                        onChange={(e) => setExpectedPrice(Number(e.target.value))}
                        placeholder="e.g. 25.5"
                        className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 pl-12 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleNextStep}
                    className="bg-[#c5a059] text-zinc-950 px-6 py-3.5 rounded-xl font-sans font-bold text-xs tracking-widest uppercase hover:bg-[#b48a47] transition-all flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    Continue to Photos <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 FORM PANEL */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="font-sans font-bold text-lg text-white uppercase tracking-wider mb-1">
                    Upload Photographs
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    Please provide clear exterior and interior shots. Maximum 1,000,000 character limit applies per upload.
                  </p>
                </div>

                {/* Drag Frame */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handlePhotoUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-[#c5a059]/40 bg-zinc-950/40 hover:bg-zinc-900/40 p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
                >
                  <Upload className="w-10 h-10 text-zinc-500 mb-3" />
                  <p className="text-sm text-zinc-300 font-sans font-medium">Drag & drop your automotive images here</p>
                  <p className="text-[11px] text-zinc-600 font-mono mt-1">OR CLICK TO BROWSE FILES</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Loading indicator */}
                {isCompressing && (
                  <div className="flex justify-center items-center gap-2 text-xs font-mono text-zinc-400">
                    <div className="w-4 h-4 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin shrink-0" />
                    <span>{isFirebaseMock ? "Executing local HTML5 canvas compression..." : "Optimizing and uploading directly to Firebase Storage..."}</span>
                  </div>
                )}

                {/* Grid preview of images uploaded */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-zinc-950 group">
                      <img src={img} alt="Showroom car inspect" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(idx);
                        }}
                        className="absolute top-2.5 right-2.5 p-1 bg-zinc-950/80 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[9px] font-mono uppercase text-zinc-400">
                        {idx === 0 ? 'Primary' : `Image ${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons for Step 2 */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handlePrevStep}
                    className="text-zinc-400 hover:text-white font-sans font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" /> Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={images.length === 0}
                    className="bg-[#c5a059] text-zinc-950 disabled:opacity-50 px-6 py-3.5 rounded-xl font-sans font-bold text-xs tracking-widest uppercase hover:bg-[#b48a47] transition-all flex items-center gap-1.5 cursor-pointer outline-none"
                  >
                    Continue to Contacts <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 FORM PANEL */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <h3 className="font-sans font-bold text-lg text-white uppercase tracking-wider border-b border-white/5 pb-3">
                  Customer Information
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="Anil K. Ambani"
                      className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="customer@mumbai.in"
                        className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+91 93226 77711"
                        className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">Contact Channel Permission</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['WhatsApp', 'Phone', 'Email'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormContactMethod(method)}
                          className={`py-3 px-4 border rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer ${
                            formContactMethod === method
                              ? 'border-[#c5a059] bg-[#c5a059]/5 text-[#c5a059]'
                              : 'border-white/5 bg-[#1c1c1f] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Additional Notes</label>
                    <textarea
                      rows={3}
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      placeholder="e.g. Briefly describe modification state, service history check, or accessories included."
                      className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl p-3.5 text-sm text-white resize-none focus:outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Navigation Buttons for Step 3 */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="text-zinc-400 hover:text-white font-sans font-semibold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer outline-none"
                    >
                      <ArrowLeft className="w-4.5 h-4.5" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#c5a059] text-zinc-950 disabled:opacity-50 px-8 py-3.5 rounded-xl font-sans font-bold text-xs tracking-widest uppercase hover:bg-[#b48a47] transition-all flex items-center gap-1.5 cursor-pointer outline-none"
                    >
                      {isSubmitting ? 'PROCESSING VALUATION...' : 'SUBMIT APPRAISAL ENQUIRY'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
