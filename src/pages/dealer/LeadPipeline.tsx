/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVehicles } from '../../context/VehicleContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  User, 
  Phone, 
  MessageSquare, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Mail, 
  MessageCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { Lead } from '../../types';

// Structured CRM boards pipeline stages
const PIPELINE_COLUMNS = [
  { id: 'NEW', label: 'NEW INQUIRIES', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/5' },
  { id: 'CONTACTED', label: 'CONTACTED', color: 'border-blue-500/20 text-blue-400 bg-blue-950/5' },
  { id: 'NEGOTIATING', label: 'NEGOTIATION', color: 'border-amber-500/20 text-amber-400 bg-amber-950/5' },
  { id: 'WON', label: 'HANDOVER WON', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/5' },
  { id: 'LOST', label: 'CLOSED LOST', color: 'border-rose-500/20 text-rose-500 bg-rose-950/5' }
];

export const LeadPipeline: React.FC = () => {
  const { isAdmin } = useAuth();
  const { leads, updateLeadStatus, isLoading, fetchLeads } = useVehicles();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Selected lead for detail popup modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Security gate & load leads
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/dealer-management');
    } else {
      fetchLeads();
    }
  }, [isAdmin, navigate, fetchLeads]);

  // Group leads based on selected state column
  const groupedLeads = useMemo(() => {
    const map: Record<string, Lead[]> = {
      NEW: [],
      CONTACTED: [],
      NEGOTIATING: [],
      WON: [],
      LOST: []
    };

    leads.forEach((ld) => {
      const col = ld.status || 'NEW';
      if (map[col]) {
        map[col].push(ld);
      } else {
        map['NEW'].push(ld); // fallback safety
      }
    });

    return map;
  }, [leads]);

  // Handle stage change trigger
  const handleStageChange = async (leadId: string, toStage: any) => {
    try {
      await updateLeadStatus(leadId, toStage);
      showToast(`Lead pipeline transitioned to: ${toStage}`, 'success');
      
      // Update local detailed popup model state if open
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: toStage } : null);
      }
    } catch {
      showToast('Error transiting CRM pipeline stage.', 'error');
    }
  };

  const formattedWhatsAppUrl = (phone: string, text: string) => {
    const rawNumber = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen py-10 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
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
          <span className="text-[#c5a059] font-mono text-xs tracking-widest uppercase">CRM INTERACTION DESK</span>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white mt-1 leading-none">
            LEAD NEGOTIATION PIPELINE
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review buyer requests, sell evaluations, and log client discussion pipeline states instantly.
          </p>
        </div>

        {/* LOADING BOX STAGE */}
        {isLoading ? (
          <div className="text-center py-20 bg-[#121214] border border-white/5 rounded-2xl">
            <div className="w-8 h-8 border-2 border-t-transparent border-[#c5a059] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Gathering dealer CRM logs...</p>
          </div>
        ) : (
          /* Kanban Stage Column structure */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
            {PIPELINE_COLUMNS.map((col) => {
              const columnsLeads = groupedLeads[col.id] || [];
              return (
                <div key={col.id} className="flex flex-col bg-[#121214] border border-white/5 rounded-xl min-h-[60vh] overflow-hidden">
                  
                  {/* Column Header */}
                  <div className={`p-4 border-b border-white/[0.03] flex justify-between items-center ${col.color}`}>
                    <span className="font-mono text-[10px] tracking-wider font-extrabold uppercase leading-none">{col.label}</span>
                    <span className="bg-zinc-900 border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 leading-none">{columnsLeads.length}</span>
                  </div>

                  {/* List Container of Cards */}
                  <div className="p-3.5 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
                    {columnsLeads.length === 0 ? (
                      <div className="py-12 text-center text-[10px] text-zinc-600 uppercase tracking-wider font-mono select-none">No active records</div>
                    ) : (
                      columnsLeads.map((ld) => (
                        <motion.button
                          key={ld.id}
                          layoutId={`lead-card-${ld.id}`}
                          onClick={() => setSelectedLead(ld)}
                          className="w-full text-left bg-zinc-950 hover:bg-zinc-900 p-4 rounded-xl border border-white/[0.02] hover:border-zinc-800 transition-all cursor-pointer shadow-sm group flex flex-col gap-2.5 outline-none relative"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-sans font-bold text-white group-hover:text-[#c5a059] transition-colors uppercase leading-none">
                              {ld.customerName}
                            </span>
                            <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              ld.type === 'BUY_INQUIRY' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/10' : 'bg-orange-950/40 text-orange-400 border border-orange-900/10'
                            }`}>
                              {ld.type === 'BUY_INQUIRY' ? 'BUY' : 'SELL'}
                            </span>
                          </div>

                          {/* Detail summary strings */}
                          <p className="text-[10px] text-zinc-500 font-sans line-clamp-2 leading-relaxed">
                            {ld.notes}
                          </p>

                          {/* Target vehicle details */}
                          <div className="mt-1 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-zinc-500">
                            <span className="truncate max-w-[120px] uppercase">{ld.vehicleName || 'Custom Evaluation'}</span>
                            <span className="shrink-0">{new Date(ld.createdAt).toLocaleDateString()}</span>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DETAILED INTERACTIVE BOTTOM PORTAL MODAL */}
        <AnimatePresence>
          {selectedLead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              
              {/* Blur Overlay background */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLead(null)}
                className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
              />

              {/* Box frame contents */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-xl bg-[#121214] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6"
              >
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#c5a059] font-mono text-[9px] tracking-widest uppercase">CRM TRANSACTION LEDGER</span>
                    <h2 className="text-xl font-bold font-sans text-white uppercase mt-0.5 leading-none">{selectedLead.customerName}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="p-1 px-2 border border-white/5 hover:border-white/20 rounded text-[#71717a] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5 animate-pulse" />
                  </button>
                </div>

                {/* Grid details details metrics */}
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-zinc-950 px-4 py-3 border border-white/[0.02] rounded-xl">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Phone Pathways</span>
                    <p className="text-white font-mono mt-0.5">{selectedLead.customerPhone}</p>
                  </div>
                  <div className="bg-zinc-950 px-4 py-3 border border-white/[0.02] rounded-xl font-sans">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Email Address</span>
                    <p className="text-white mt-0.5 truncate">{selectedLead.customerEmail}</p>
                  </div>
                  <div className="bg-zinc-950 px-4 py-3 border border-white/[0.02] rounded-xl">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Channel preferences</span>
                    <p className="text-white mt-0.5 uppercase font-mono font-bold text-[#c5a059]">{selectedLead.preferredContactMethod || 'WhatsApp'}</p>
                  </div>
                  <div className="bg-zinc-950 px-4 py-3 border border-white/[0.02] rounded-xl">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Current Phase status</span>
                    <p className="text-emerald-400 mt-0.5 uppercase font-mono font-bold">{selectedLead.status}</p>
                  </div>
                </div>

                {/* Submitting context vehicle */}
                <div className="bg-zinc-950 border border-white/[0.02] p-4 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">INQUIRY CONTEXT CAR</span>
                    <span className="font-bold text-white uppercase">{selectedLead.vehicleName || 'Custom direct offer catalog'}</span>
                  </div>
                  {selectedLead.expectedPrice && (
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">ASking evaluation price</span>
                      <p className="font-mono font-bold text-[#c5a059] text-sm">₹{selectedLead.expectedPrice} Lakh</p>
                    </div>
                  )}
                </div>

                {/* Extra Notes */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Client request Narrative</span>
                  <div className="bg-[#1c1c1f] p-4 text-xs text-zinc-300 leading-relaxed font-sans rounded-xl border border-white/[0.02]">
                    {selectedLead.notes || 'No custom details cataloged.'}
                  </div>
                </div>

                {/* Action transits */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Transit stage position</span>
                  <div className="flex flex-wrap gap-2">
                    {PIPELINE_COLUMNS.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => handleStageChange(selectedLead.id, stage.id)}
                        className={`py-2 px-3 hover:scale-[1.02] rounded-lg text-[10px] font-mono font-extrabold uppercase transition-all cursor-pointer ${
                          selectedLead.status === stage.id
                            ? 'bg-[#c5a059] border-[#c5a059] text-zinc-950'
                            : 'bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white hover:border-zinc-500'
                        }`}
                      >
                        {stage.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Immediate WhatsApp triggering CTA buttons */}
                <div className="flex gap-4 mt-2">
                  <a
                    href={`tel:${selectedLead.customerPhone}`}
                    className="flex-1 text-center py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/5 hover:border-white/20 text-xs font-bold uppercase rounded-lg transition-all"
                  >
                    Direct Audio Call RTO
                  </a>
                  <a
                    href={formattedWhatsAppUrl(
                      selectedLead.customerPhone, 
                      `Greetings ${selectedLead.customerName}! This is representative from Bombay Motors. We received your premium pre-owned inquiry regarding ${selectedLead.vehicleName}. Shall we schedule an inspect table check?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> Message WhatsApp
                  </a>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
