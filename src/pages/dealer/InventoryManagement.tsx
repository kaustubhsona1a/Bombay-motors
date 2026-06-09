/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicles } from '../../context/VehicleContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ChevronLeft, 
  Calendar, 
  Sparkles,
  ShieldAlert,
  Archive
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const { vehicles, deleteVehicle, updateVehicle, seedDataIfNeeded, isLoading } = useVehicles();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Dialog State for sandbox-friendly delete confirmation
  const [vehicleToDelete, setVehicleToDelete] = React.useState<{ id: string; name: string } | null>(null);

  // Route protection - security check
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/dealer-management');
    }
  }, [isAdmin, navigate]);

  const handleStatusChange = async (id: string, currentStatus: string, newStatus: any) => {
    try {
      await updateVehicle(id, { status: newStatus });
      showToast(`Vehicle status configured to: ${newStatus.toUpperCase()}`, 'success');
    } catch {
      showToast('Error altering vehicle status.', 'error');
    }
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setVehicleToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle(vehicleToDelete.id);
      showToast('Luxury vehicle listing removed successfully.', 'success');
    } catch {
      showToast('Error removing listing from database.', 'error');
    } finally {
      setVehicleToDelete(null);
    }
  };

  const handleSeedMockData = async () => {
    try {
      await seedDataIfNeeded();
      showToast('Showroom seeded with mock stock!', 'success');
    } catch {
      showToast('Database is already seeded or locked.', 'info');
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)} Lakh`;
  };

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation back and Seeding capabilities */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <Link 
            to="/dealer-management" 
            className="text-xs font-mono font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4 text-[#c5a059]" />
            Back to Dashboard
          </Link>

          <button
            onClick={handleSeedMockData}
            className="px-4 py-2 border border-[#c5a059]/30 hover:border-[#c5a059] bg-[#c5a059]/5 text-xs font-mono text-[#c5a059] rounded-lg cursor-pointer transition-colors"
          >
            Seed Showroom if empty
          </button>
        </div>

        {/* Header Title list */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 font-sans">
          <div>
            <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">STOCK ARCHIVES</span>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-white leading-none mt-1">
              INVENTORY WAREHOUSE
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Add, inspect, edit specifications, or transition listings across Sales Pipelines.
            </p>
          </div>

          <Link
            to="/dealer-management/inventory/add"
            className="px-5 py-3 bg-[#c5a059] text-[#09090b] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#b48a47] transition-all flex items-center gap-1.5 shadow-xl shadow-[#c5a059]/5"
          >
            <PlusCircle className="w-4.5 h-4.5" /> Launch Listing
          </Link>
        </div>

        {/* 1. DATA TABLE DISPLAY FOR HIGH FIDELITY ADMINS */}
        {isLoading ? (
          <div className="text-center py-20 bg-[#121214] border border-white/5 rounded-2xl">
            <div className="w-8 h-8 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Gathering registered warehouse listings...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-[#121214] border border-white/5 rounded-2xl flex flex-col items-center">
            <ShieldAlert className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400 font-sans font-medium">Showroom current database is empty.</p>
            <button
              onClick={handleSeedMockData}
              className="text-xs font-mono text-[#c5a059] border border-[#c5a059]/20 bg-[#c5a059]/5 p-3 rounded-lg mt-4 hover:bg-[#c5a059]/15 cursor-pointer"
            >
              Populate Showroom with Luxury Collections
            </button>
          </div>
        ) : (
          <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                
                {/* Custom dark table head headers */}
                <thead>
                  <tr className="bg-zinc-950 uppercase text-[9px] font-mono tracking-widest text-[#71717a] border-b border-white/[0.04]">
                    <th className="py-4 px-6 w-20">PREVIEW</th>
                    <th className="py-4 px-6">VEHICLE DETAILS</th>
                    <th className="py-4 px-6">PRICE</th>
                    <th className="py-4 px-6">MILEAGE</th>
                    <th className="py-4 px-6">STATUS CODE</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>

                {/* Table Data body */}
                <tbody className="divide-y divide-white/[0.03]">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-4 px-6">
                        <img 
                          src={vehicle.images[0] || 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=150'} 
                          alt="Thumbnail previews"
                          className="w-16 aspect-video object-cover rounded-md border border-white/5 shrink-0" 
                        />
                      </td>

                      {/* Technical specifications info details */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <Link to={`/inventory/${vehicle.id}`} className="font-sans font-bold text-sm text-white hover:text-[#c5a059] transition-colors uppercase leading-none">
                            {vehicle.make} {vehicle.model}
                          </Link>
                          <span className="text-[10px] text-zinc-500 uppercase">{vehicle.variant} • {vehicle.year} • {vehicle.registration}</span>
                        </div>
                      </td>

                      {/* Price Valuations */}
                      <td className="py-4 px-6 font-mono font-semibold text-white">
                        {formatPrice(vehicle.price)}
                      </td>

                      {/* Mileage info */}
                      <td className="py-4 px-6 font-mono text-zinc-400">
                        {vehicle.mileage.toLocaleString()} KM
                      </td>

                      {/* Dropdown status switches */}
                      <td className="py-4 px-6">
                        <div className="relative w-36">
                          <select
                            value={vehicle.status}
                            onChange={(e) => handleStatusChange(vehicle.id, vehicle.status, e.target.value)}
                            className="w-full bg-zinc-950/80 border border-white/5 focus:border-[#c5a059] rounded px-3 py-1.5 text-[10px] font-mono tracking-wider font-bold uppercase text-zinc-300 appearance-none cursor-pointer outline-none"
                          >
                            <option value="active">Active Showcase</option>
                            <option value="reserved">Reserved</option>
                            <option value="sold">Sold</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </td>

                      {/* Action Triggers */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          {/* Navigate details */}
                          <Link 
                            to={`/inventory/${vehicle.id}`} 
                            target="_blank"
                            className="p-1.5 hover:bg-zinc-950 border border-transparent hover:border-white/5 text-zinc-500 hover:text-white rounded-lg transition-all"
                            title="Preview listing on live site"
                          >
                            <ExternalLink className="w-4 h-4 text-[#c5a059]" />
                          </Link>

                          {/* Edit Form path */}
                          <Link 
                            to={`/dealer-management/inventory/edit/${vehicle.id}`}
                            className="p-1.5 hover:bg-zinc-950 border border-transparent hover:border-white/5 text-zinc-500 hover:text-white rounded-lg transition-all"
                            title="Edit specifications"
                          >
                            <Edit3 className="w-4 h-4 text-[#c5a059]" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteTrigger(vehicle.id, `${vehicle.make} ${vehicle.model}`)}
                            className="p-1.5 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/10 text-zinc-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                            title="Delete listing permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>

      {/* Visual Confirm Dialog Overlay */}
      {vehicleToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="border border-white/10 bg-[#121214] p-6 max-w-md w-full rounded-2xl flex flex-col gap-4 shadow-2xl"
          >
            <div>
              <span className="text-[#c5a059] font-mono text-[10px] tracking-[0.2em] uppercase">Security Clearance Required</span>
              <h3 className="text-base font-bold text-white uppercase tracking-tight mt-1">Conclude Listing Permanently?</h3>
            </div>
            
            <p className="text-xs text-zinc-450 leading-relaxed font-sans">
              Are you sure you wish to decommission <strong className="text-[#c5a059] uppercase font-semibold">"{vehicleToDelete.name}"</strong>? Moving this asset to absolute removal is irreversible. This record will be entirely purged from storage immediately.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2 font-mono text-[10px] tracking-wider uppercase">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="w-full py-3 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-white rounded-xl transition-all font-medium cursor-pointer"
              >
                Retain Stock
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-3 bg-rose-950/40 hover:bg-rose-900 border border-rose-900/50 hover:border-rose-750 text-rose-300 hover:text-white rounded-xl transition-all font-bold cursor-pointer"
              >
                Confirm Deletion
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
