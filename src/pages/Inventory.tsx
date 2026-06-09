/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Gauge, 
  Fuel, 
  Calendar, 
  ArrowUpDown, 
  Sparkles,
  ArrowUpRight,
  RefreshCw 
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { vehicles, isLoading } = useVehicles();
  
  // States of search & filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedOwnership, setSelectedOwnership] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', '2'..'10', '10_plus'
  const [sortBy, setSortBy] = useState('recently_added');

  // Dynamically find values inside listings
  const brands = useMemo(() => {
    const list = ['All'];
    vehicles.forEach(v => {
      if (!list.includes(v.make)) list.push(v.make);
    });
    return list;
  }, [vehicles]);

  const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
  const transmissions = ['All', 'Automatic', 'Manual'];
  const ownerships = ['All', '1', '2', '3'];

  // Price dropdown options matching family budget targets from below 2 Lakhs, then 3 Lakhs, up to 10 Lakhs, and above 10 Lakhs
  const priceOptions = useMemo(() => {
    return [
      { label: 'No Limit', value: 'all' },
      { label: 'Below ₹2 Lakhs', value: '2' },
      { label: 'Up to ₹3 Lakhs', value: '3' },
      { label: 'Up to ₹4 Lakhs', value: '4' },
      { label: 'Up to ₹5 Lakhs', value: '5' },
      { label: 'Up to ₹6 Lakhs', value: '6' },
      { label: 'Up to ₹7 Lakhs', value: '7' },
      { label: 'Up to ₹8 Lakhs', value: '8' },
      { label: 'Up to ₹9 Lakhs', value: '9' },
      { label: 'Up to ₹10 Lakhs', value: '10' },
      { label: 'Above ₹10 Lakhs', value: '10_plus' }
    ];
  }, []);

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setSelectedBrand('All');
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setSelectedOwnership('All');
    setPriceFilter('all');
    setSortBy('recently_added');
  };

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => v.status === 'active') // Only display active vehicles to customers
      .filter((v) => {
        const matchesSearch = 
          v.make.toLowerCase().includes(search.toLowerCase()) ||
          v.model.toLowerCase().includes(search.toLowerCase()) ||
          v.variant.toLowerCase().includes(search.toLowerCase()) ||
          v.year.toString().includes(search);
        
        const matchesBrand = selectedBrand === 'All' || v.make === selectedBrand;
        const matchesFuel = selectedFuel === 'All' || v.fuelType === selectedFuel;
        const matchesTransmission = selectedTransmission === 'All' || v.transmission === selectedTransmission;
        const matchesOwnership = selectedOwnership === 'All' || v.ownerCount.toString() === selectedOwnership;
        
        let matchesPrice = true;
        if (priceFilter === '10_plus') {
          matchesPrice = v.price > 10;
        } else if (priceFilter !== 'all') {
          matchesPrice = v.price <= Number(priceFilter);
        }

        return matchesSearch && matchesBrand && matchesFuel && matchesTransmission && matchesOwnership && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low_high') return a.price - b.price;
        if (sortBy === 'price_high_low') return b.price - a.price;
        if (sortBy === 'year_newest') return b.year - a.year;
        if (sortBy === 'km_lowest') return a.mileage - b.mileage;
        if (sortBy === 'recently_added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [vehicles, search, selectedBrand, selectedFuel, selectedTransmission, selectedOwnership, priceFilter, sortBy]);

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)} Lakh`;
  };

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="text-[#c5a059] font-mono text-xs tracking-[0.25em] uppercase">BOMBAY MOTORS COLLECTION</span>
          <h1 className="text-3xl md:text-5xl font-sans font-bold text-white uppercase tracking-tight mt-1 leading-none">
            APPROVED PRE-OWNED STOCK
          </h1>
          <p className="text-sm text-zinc-500 font-sans mt-2 max-w-xl">
            Each automotive machine goes through an exhaustive bumper inspection and meticulous paint correction processes.
          </p>
        </div>

        {/* 1. FILTERING & SEARCH CONSOLE */}
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
          {/* Top Search bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-1 md:col-span-3 relative">
              <Search className="w-5 h-5 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Make, Model, Variant, or Year (e.g., E-Class, Fortuner, 2022)..."
                className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl py-3.5 pl-12 pr-4 text-sm font-sans placeholder-zinc-600 text-white focus:outline-none transition-all"
              />
            </div>
            
            {/* Sorting trigger */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-[#c5a059] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#1c1c1f] border border-white/5 focus:border-[#c5a059]/40 rounded-xl py-3.5 pl-11 pr-10 text-xs font-sans text-[#a1a1aa] uppercase tracking-wider focus:outline-none appearance-none cursor-pointer"
              >
                <option value="recently_added">Recently Added</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="year_newest">Newest Year</option>
                <option value="km_lowest">Lowest Mileage</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <hr className="border-white/5 my-6" />

          {/* Quick Dropdown Selectors */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Brands */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-bold">MANUFACTURER</label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/[0.05] focus:border-[#c5a059]/40 rounded-lg py-2.5 px-3 text-xs text-zinc-300 font-sans focus:outline-none appearance-none cursor-pointer"
                >
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Fuel Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-bold">FUEL ENGINE</label>
              <div className="relative">
                <select
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/[0.05] focus:border-[#c5a059]/40 rounded-lg py-2.5 px-3 text-xs text-zinc-300 font-sans focus:outline-none appearance-none cursor-pointer"
                >
                  {fuelTypes.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Transmission */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-bold">TRANSMISSION</label>
              <div className="relative">
                <select
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/[0.05] focus:border-[#c5a059]/40 rounded-lg py-2.5 px-3 text-xs text-zinc-300 font-sans focus:outline-none appearance-none cursor-pointer"
                >
                  {transmissions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Ownership */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-bold">HISTORIC OWNERS</label>
              <div className="relative">
                <select
                  value={selectedOwnership}
                  onChange={(e) => setSelectedOwnership(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/[0.05] focus:border-[#c5a059]/40 rounded-lg py-2.5 px-3 text-xs text-zinc-300 font-sans focus:outline-none appearance-none cursor-pointer"
                >
                  {ownerships.map(o => (
                    <option key={o} value={o}>{o === 'All' ? 'All Owners' : `${o}st/2nd Owner`}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Price Filter Dropdown */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-widest text-[#71717a] uppercase font-bold">PRICE TARGET</label>
              <div className="relative">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-white/[0.05] focus:border-[#c5a059]/40 rounded-lg py-2.5 px-3 text-xs text-zinc-300 font-sans focus:outline-none appearance-none cursor-pointer"
                >
                  {priceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Reset Filters CTA */}
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="text-xs font-mono tracking-widest uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              RESET FILTERS
            </button>
          </div>
        </div>

        {/* 2. RESULTS SHOWROOM GRID */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin" />
            <p className="text-sm font-mono text-zinc-500">Retrieving showroom inventory...</p>
          </div>
        ) : (
          <div>
            {/* Count Indicator */}
            <div className="mb-6 font-mono text-xs text-zinc-500 flex justify-between items-center px-2">
              <span>FOUND {filteredVehicles.length} APPROVED AUTOMOBILES</span>
              <span>L.B.S. Marg Showroom, Mumbai</span>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredVehicles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 border border-white/5 bg-[#121214] rounded-2xl flex flex-col items-center"
                >
                  <SlidersHorizontal className="w-10 h-10 text-zinc-700 mb-4" />
                  <p className="text-zinc-400 font-sans font-medium">No results match your selected criteria.</p>
                  <button
                    onClick={resetFilters}
                    className="text-xs font-mono text-[#c5a059] border border-[#c5a059]/20 bg-[#c5a059]/5 px-4 py-2 mt-4 rounded-lg hover:bg-[#c5a059]/15 transition-all"
                  >
                    Clear Search & Filters
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {filteredVehicles.map((vehicle, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={vehicle.id}
                      className="bg-[#1c1c1f] rounded-xl overflow-hidden border border-white/[0.05] hover:border-[#c5a059]/20 transition-all duration-300 group flex flex-col justify-between"
                    >
                      {/* Image Viewer */}
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

                          {/* Technical spec row */}
                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.03] text-zinc-400 font-mono text-[11px] mb-4">
                            <div className="flex items-center gap-1 justify-center md:justify-start">
                              <Gauge className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                              <span>{vehicle.mileage.toLocaleString()} KM</span>
                            </div>
                            <div className="flex items-center gap-1 justify-center md:justify-start">
                              <Fuel className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                              <span>{vehicle.fuelType}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-center md:justify-start">
                              <Calendar className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                              <span>{vehicle.transmission.slice(0, 4)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-mono tracking-wider text-zinc-400 uppercase mb-0.5">EST. VALUE</span>
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
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
