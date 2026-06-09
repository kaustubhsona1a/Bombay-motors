/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  ArrowUpRight, 
  PhoneCall, 
  MapPin, 
  Calendar, 
  Fuel, 
  Gauge, 
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Anand Iyer (Mulund West)',
    rating: 5,
    text: 'We were looking for a reliable 7-seater for weekend family outings, and Bombay Motors found us a pristine Toyota Innova Crysta. The entire RC transfer was completely handled by them, and they got our low-interest HDFC loan approved in just 48 hours. True professionals who understand family budgets!'
  },
  {
    id: 2,
    name: 'Pooja Sharma (LBS Marg)',
    rating: 5,
    text: 'As a school teacher, passenger safety was my topmost priority. Bombay Motors showed me the detailed 120-point digital health inspection cert of the Hyundai Creta we bought. Extremely friendly service, absolute transparency, and zero sales pressure. Highly recommended for families!'
  },
  {
    id: 3,
    name: 'Milind Tambe (Gavanpada)',
    rating: 5,
    text: 'They helped me exchange our old hatchback for an automatic Maruti Ertiga Hybrid. The pricing was incredibly honest, clean handovers, and they handled all transfer paperwork stress-free. 100% satisfied with their transparent, customer-first service!'
  }
];

export const Home: React.FC = () => {
  const { vehicles } = useVehicles();
  const { siteConfig } = useSiteConfig();
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Autoplay Client Reflections / Testimonials Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevReview = () => {
    setActiveReviewIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNextReview = () => {
    setActiveReviewIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  // Filter for featured vehicles or just active vehicles
  const featured = vehicles.filter(v => v.status === 'active').slice(0, 3);

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)} Lakh`;
  };

  const formattedWhatsApp = siteConfig.whatsApp ? siteConfig.whatsApp.replace(/[^0-9]/g, '') : '';

  return (
    <div className="bg-transparent text-[#f4f4f5]">
      {/* 1. HERO SECTION WITH SHOWROOM STYLING */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950 pt-16 md:pt-20">
        {/* Background Image with subtle Ken Burns overlay effect */}
        <div className="absolute inset-0 z-0">
          {/* Multi-layered dark overlay to guarantee superb legibility on both bright and dark screens */}
          <div className="absolute inset-0 bg-black/65 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] z-10" />
          <motion.img
            src={siteConfig.heroBanner}
            initial={{ scale: 1.1, opacity: 0.95 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 15, ease: 'easeOut' }}
            alt="Family Automobile"
            className="w-full h-full object-cover pointer-events-none select-none filter brightness-[0.5]"
          />
        </div>

        {/* Hero content container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#c5a059] font-mono text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.28em] uppercase mb-4 block max-w-full px-2"
          >
            ESTD. 1986 • CELEBRATING 40 YEARS OF FAMILY TRUST
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-7xl font-sans font-bold tracking-tight mb-6 max-w-4xl text-white uppercase leading-tight sm:leading-none"
          >
            FIND YOUR PERFECT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-[#c5a059]">
              FAMILY VEHICLE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm md:text-lg text-zinc-100/95 font-sans max-w-2xl mb-10 leading-relaxed font-normal tracking-wide"
          >
            Highly trusted pre-owned family cars in Mulund. Carefully inspected, certified, and delivered with 100% transparent history. Explore certified Ertiga, Creta, Innova, Nexon & more with absolute peace of mind.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/inventory"
              className="bg-[#c5a059] text-[#09090b] hover:bg-[#b48a47] font-semibold text-xs tracking-widest uppercase px-8 py-4 rounded-lg flex items-center gap-2 transition-all duration-300 group shadow-lg shadow-[#c5a059]/10 hover:shadow-[#c5a059]/20 font-sans"
            >
              Explore Collection 
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/sell"
              className="bg-transparent hover:bg-white/5 border border-white/20 text-white font-semibold text-xs tracking-widest uppercase px-8 py-4 rounded-lg transition-all font-sans"
            >
              Sell Your Car
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="py-20 px-6 md:px-8 border-b border-white/5 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#c5a059] font-mono text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] uppercase block px-4 leading-normal">40 YEARS ON L.B.S. MARG • SERVING 15,000+ MUMBAI FAMILIES</span>
            <h2 className="text-2xl md:text-4xl font-sans font-bold text-white uppercase tracking-tight mt-2">
              WHY CHOOSE BOMBAY MOTORS
            </h2>
            <div className="w-12 h-1 bg-[#c5a059] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-8 hover:border-[#c5a059]/20 transition-all duration-300 group">
              <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-lg p-3 w-fit mb-6 transition-colors group-hover:bg-[#c5a059]/10">
                <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-sans font-bold text-white mb-3 uppercase tracking-wide">
                120-Point Rigorous Safety Check
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-light">
                Every hatchback, SUV, and sedan undergoes an exhaustive bumper-to-bumper inspection. We verify engine compression, brake pad wear, airbag safety modules, and absolute odometer transparency to keep your family safe.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-8 hover:border-[#c5a059]/20 transition-all duration-300 group">
              <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-lg p-3 w-fit mb-6 transition-colors group-hover:bg-[#c5a059]/10">
                <CreditCard className="w-6 h-6 text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-sans font-bold text-white mb-3 uppercase tracking-wide">
                Low Interest Loans & Free RC Transfer
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-light">
                We partner with SBI, ICICI, HDFC, and Kotak Bank to secure the lowest interest rates for your family. We handle 100% of the RTO paperwork and RC book transfers at no extra fee.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-8 hover:border-[#c5a059]/20 transition-all duration-300 group">
              <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-lg p-3 w-fit mb-6 transition-colors group-hover:bg-[#c5a059]/10">
                <Sparkles className="w-6 h-6 text-[#c5a059]" />
              </div>
              <h3 className="text-lg font-sans font-bold text-white mb-3 uppercase tracking-wide">
                Pristine Sanitized Handover
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-light">
                Each family car goes through deep steam sanitization, multi-stage interior cleaning, and detailed paint glaze protection. Drive off in safety, comfort, and unmatched hygiene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLECTION */}
      <section className="py-20 px-6 md:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">OUR VERIFIED INVENTORY</span>
              <h2 className="text-2xl md:text-4xl font-sans font-bold text-white uppercase tracking-tight mt-1">
                FEATURED FAMILY CARS
              </h2>
            </div>
            <Link 
              to="/inventory" 
              className="text-[#c5a059] hover:text-[#b48a47] font-mono font-medium text-xs uppercase tracking-widest flex items-center gap-1 group"
            >
              View Full Showroom 
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.length === 0 ? (
              <div className="col-span-3 text-center py-16 border border-white/5 bg-[#121214] rounded-xl">
                <p className="text-zinc-500 font-sans">No luxury cars currently showcased in active collection.</p>
              </div>
            ) : (
              featured.map((vehicle, idx) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  id={`featured-${vehicle.id}`}
                  className="bg-[#1c1c1f] rounded-xl overflow-hidden border border-white/[0.05] hover:border-[#c5a059]/30 transition-all duration-300 group flex flex-col justify-between"
                >
                  <Link to={`/inventory/${vehicle.id}`} className="block relative aspect-video overflow-hidden">
                    <img 
                      src={vehicle.images[0] || 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600'} 
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-zinc-950/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono uppercase tracking-widest border border-white/10 text-[#c5a059]">
                      {vehicle.year}
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-sans font-bold text-lg text-white group-hover:text-[#c5a059] transition-colors leading-tight">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <span className="font-mono text-xs text-zinc-500 shrink-0">{vehicle.ownerCount === 1 ? '1st Owner' : `${vehicle.ownerCount}nd Owner`}</span>
                      </div>
                      <p className="text-zinc-500 text-xs font-sans mb-4">{vehicle.variant}</p>
                      
                      {/* Specifications Bar */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.03] text-zinc-400 font-mono text-[11px] mb-4">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span>{vehicle.mileage.toLocaleString()} KM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-zinc-600 shrink-0 animate-pulse" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          <span>{vehicle.transmission.slice(0, 4)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono tracking-wider text-zinc-400 uppercase mb-0.5">OUTLET PRICE</span>
                        <span className="text-lg font-mono font-bold text-[#c5a059] leading-none">
                          {formatPrice(vehicle.price)}
                        </span>
                      </div>
                      <Link
                        to={`/inventory/${vehicle.id}`}
                        className="bg-zinc-900 border border-white/10 hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 text-white font-sans text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        Details
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#c5a059]" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. REVIEWS TESTIMONIALS CAROUSEL */}
      <section className="py-20 px-6 md:px-8 border-b border-white/5 relative overflow-hidden bg-zinc-950/60">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-[#c5a059] font-mono text-xs tracking-[0.2em] uppercase">CLIENT REFLECTIONS</span>
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-white uppercase tracking-tight mt-1">
              APPROVED BY CONNOISSEURS
            </h2>
            <a 
              href={siteConfig.googleReviewsUrl || "https://www.google.com/maps/search/?api=1&query=Bombay+Motors+Ekta+Apartment+LBS+Marg+Mulund+West+Mumbai"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 flex-wrap text-[#c5a059] mt-3 font-mono text-[10px] sm:text-xs md:text-sm leading-normal uppercase tracking-wider hover:underline hover:text-[#e4be78] transition-all cursor-pointer px-4"
            >
              <span>GOOGLE RATING: {siteConfig.googleRating || 4.3} ★</span>
              <span className="text-zinc-600 font-sans mx-2">•</span>
              <span>{siteConfig.reviewsCount || 109} VERIFIED REVIEWS</span>
            </a>
          </div>

          <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="flex justify-center gap-1.5 mb-6 text-[#c5a059]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>

            {/* Carousel Content wrapped in easy slider buttons */}
            <div className="relative px-6 md:px-12">
              <button
                type="button"
                onClick={handlePrevReview}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-[#c5a059] transition-all cursor-pointer z-10 hidden md:block"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="min-h-[120px] flex flex-col justify-center">
                <p className="text-base md:text-lg text-zinc-350 italic font-sans font-light leading-relaxed text-center mb-6">
                  "{TESTIMONIALS[activeReviewIdx].text}"
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextReview}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-[#c5a059] transition-all cursor-pointer z-10 hidden md:block"
                aria-label="Next review"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <h4 className="text-center font-sans font-bold text-white uppercase tracking-wider text-sm mt-4">
              {TESTIMONIALS[activeReviewIdx].name}
            </h4>
            <p className="text-center font-mono text-[10px] text-[#c5a059] tracking-widest mt-1 uppercase">
              VERIFIED MUMBAI PURCHASER
            </p>

            {/* Slider Dots & Mobile Nav */}
            <div className="flex justify-center items-center gap-4 mt-8">
              {/* Mobile Arrows */}
              <button
                type="button"
                onClick={handlePrevReview}
                className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-zinc-400 md:hidden cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2.5">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveReviewIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeReviewIdx ? 'bg-[#c5a059] scale-125' : 'bg-zinc-700 hover:bg-zinc-500'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextReview}
                className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-zinc-400 md:hidden cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOWROOM LOCATION & CONTACT CTAs */}
      <section className="py-20 px-6 md:px-8 relative overflow-hidden bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col gap-6">
            <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase"> VISIT THE SHOWROOM </span>
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-white uppercase tracking-tight leading-none">
              EXPERIENCE THE BOUTIQUE IN PERSON
            </h2>
            <p className="text-sm md:text-base text-zinc-400 font-sans font-light leading-relaxed">
              We welcome you to our showroom opposing the Santoshimata Mandir on L.B.S. Marg in Mulund West. Take a guided inspection ride or speak directly to our automotive specialists over a freshly brewed espresso.
            </p>

            <div className="flex flex-col gap-4 mt-4 text-sm font-sans text-zinc-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#c5a059] shrink-0" />
                <span>Available Mon-Sun: 10:00 AM - 08:30 PM (Inc. Bank Holidays)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <a 
                href={`tel:${siteConfig.phone}`}
                className="bg-zinc-900 border border-white/10 hover:border-white/20 px-6 py-4 rounded-lg flex items-center gap-2.5 text-white font-semibold text-xs uppercase tracking-widest transition-all hover:bg-white/[0.02]"
              >
                <PhoneCall className="w-4 h-4 text-[#c5a059]" />
                Call Dealership
              </a>
              <a 
                href={`https://wa.me/${formattedWhatsApp}?text=Hi%20Bombay%20Motors,%20I%20would%20like%20to%20reserve%20a%20viewing%20at%20your%20L.B.S.%20Marg%20showroom.`}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 px-6 py-4 rounded-lg flex items-center gap-2.5 text-emerald-300 hover:text-emerald-200 font-semibold text-xs uppercase tracking-widest transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Inquiry
              </a>
            </div>
          </div>

          {/* Simple Premium Map Card */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 relative aspect-[4/3] flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#c5a059_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SHOWROOM COORDINATES</span>
              <span className="text-xs font-sans text-[#c5a059] font-medium">Mulund West, Opp. Santoshimata Mandir</span>
            </div>

            {/* Interactive Embedded Google Map */}
            <div className="flex-1 my-4 bg-zinc-950 rounded-xl border border-white/5 relative z-10 overflow-hidden min-h-[160px] group/map">
              <iframe
                title="Google Map Showroom Location"
                width="100%"
                height="100%"
                className="w-full h-full border-0 grayscale invert opacity-75 contrast-125 brightness-90 hover:opacity-100 hover:grayscale-0 hover:invert-0 transition-all duration-500 rounded-xl"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(siteConfig.address || "Bombay Motors Mulund West Opposite Santoshimata Mandir Mumbai")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-zinc-950/90 text-[10px] font-mono text-[#c5a059] border border-white/10 rounded pointer-events-none select-none tracking-widest uppercase">
                Interactive Map
              </div>
            </div>

            <a 
              href={siteConfig.googleMapsUrl || `https://maps.google.com/?q=Bombay+Motors+Mulund+West+Opposite+Santoshimata+Mandir`}
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 w-full text-center py-3 bg-[#c5a059] text-[#09090b] hover:bg-[#b48a47] rounded-lg font-sans font-semibold text-xs tracking-widest uppercase transition-colors"
            >
              Get Navigation Link
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
