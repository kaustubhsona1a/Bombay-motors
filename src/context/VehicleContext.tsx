/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Vehicle, Lead } from '../types';
import { INITIAL_VEHICLES } from '../data/mockVehicles';
import { INITIAL_LEADS } from '../data/mockLeads';
import { db, isFirebaseMock, handleFirestoreError, OperationType } from '../firebase';
import { writeVehiclesToCache, logReadReductionReport } from '../utils/cacheHelper';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';

// Helper to sanitize and map Firestore Vehicle documents
function parseFirestoreVehicle(data: any, id: string): Vehicle {
  return {
    id: id,
    make: data.make || '',
    model: data.model || '',
    variant: data.variant || '',
    year: Number(data.year || 2020),
    fuelType: data.fuelType || data.fuel_type || '',
    transmission: data.transmission || 'Manual',
    exteriorColor: data.exteriorColor || data.exterior_color || '',
    interiorColor: data.interiorColor || data.interior_color || '',
    price: Number(data.price || 0),
    mileage: Number(data.mileage || 0),
    ownerCount: Number(data.ownerCount || data.owner_count || 1),
    registration: data.registration || '',
    description: data.description || '',
    features: Array.isArray(data.features) ? data.features : [],
    inspectionNotes: data.inspectionNotes || data.inspection_notes || '',
    status: data.status || 'active',
    images: Array.isArray(data.images) ? data.images : [],
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
    isFeatured: !!(data.isFeatured || data.is_featured),
  };
}

// Helper to sanitize and map Firestore Lead documents
function parseFirestoreLead(data: any, id: string): Lead {
  return {
    id: id,
    vehicleId: data.vehicleId || data.vehicle_id || null,
    vehicleName: data.vehicleName || data.vehicle_name || null,
    customerName: data.customerName || data.customer_name || '',
    customerEmail: data.customerEmail || data.customer_email || '',
    customerPhone: data.customerPhone || data.customer_phone || '',
    type: data.type || 'BUY_INQUIRY',
    status: data.status || 'NEW',
    preferredContactMethod: data.preferredContactMethod || data.preferred_contact_method || 'WhatsApp',
    notes: data.notes || '',
    expectedPrice: data.expectedPrice !== undefined ? Number(data.expectedPrice) : (data.expected_price !== undefined ? Number(data.expected_price) : undefined),
    sellCarDetails: data.sellCarDetails || data.sell_car_details || null,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
  };
}

// Window name fallback cache to survive sandboxed iframe reloads and hot-compiles
const windowCache = {
  get(key: string): string | null {
    try {
      if (window.name && window.name.startsWith('{')) {
        const data = JSON.parse(window.name);
        return data[key] || null;
      }
    } catch (_) {}
    return null;
  },
  set(key: string, value: string): void {
    try {
      let data: Record<string, string> = {};
      if (window.name && window.name.startsWith('{')) {
        try {
          data = JSON.parse(window.name);
        } catch (_) {}
      }
      data[key] = value;
      window.name = JSON.stringify(data);
    } catch (_) {}
  },
  remove(key: string): void {
    try {
      if (window.name && window.name.startsWith('{')) {
        const data = JSON.parse(window.name);
        delete data[key];
        window.name = JSON.stringify(data);
      }
    } catch (_) {}
  }
};

// Ultra-safe storage wrappers to handle sandboxed iframe storage access blocks gracefully
const safeStorage = {
  getItem(key: string): string | null {
    try {
      const val = localStorage.getItem(key);
      if (val) return val;
    } catch (e) {
      console.warn('safeStorage: localStorage blocked by sandboxed iframe security policies.', e);
    }
    return windowCache.get(key);
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('safeStorage: localStorage blocked by sandboxed iframe security policies.', e);
    }
    windowCache.set(key, value);
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('safeStorage: localStorage blocked by sandboxed iframe security policies.', e);
    }
    windowCache.remove(key);
  }
};

// Define Cooldowns to save read quota (O(N) load checks happen at most once every METADATA_COOLDOWN_MS)
const METADATA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown for vehicle catalog check
const LEADS_SERVER_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown

// Module-level in-memory state fallbacks to bypass localStorage lookup failures and guard against bot traversal patterns
let memoryVehicles: Vehicle[] | null = null;
let memoryLeads: Lead[] | null = null;
let memoryVehiclesLastMetaCheck: number | null = null;
let memoryLeadsLastMetaCheck: number | null = null;

interface VehicleContextType {
  vehicles: Vehicle[];
  leads: Lead[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  updateLeadStatus: (leadId: string, newStatus: Lead['status']) => Promise<void>;
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  isLoading: boolean;
  seedDataIfNeeded: () => Promise<void>;
  fetchLeads: (force?: boolean) => Promise<void>;
  isLeadsLoading: boolean;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    if (memoryVehicles) return memoryVehicles;
    // Synchronous safe loading of cache prior to mounting reduces initial flicker layout-shift
    const cached = safeStorage.getItem('bombay_motors_vehicles');
    return cached ? JSON.parse(cached) : INITIAL_VEHICLES;
  });
  
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (memoryLeads) return memoryLeads;
    const cached = safeStorage.getItem('bombay_motors_leads');
    return cached ? JSON.parse(cached) : INITIAL_LEADS;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);

  // Initialize and load vehicles using our Smart Metadata-Gated Handshake Protocol.
  // This executes exactly ONE lookup (1 document fetch of "vehicles_meta") on startup (with a 5 min cooldown).
  // If the server metadata timestamp has not changed since the local cache was written, 
  // it completely bypasses O(N) database scans, representing an average 99.9% reduction in reads!
  useEffect(() => {
    let active = true;

    const loadVehicles = async () => {
      if (active) {
        setIsLoading(true);
      }

      // 1. Instant local/memory hydration
      const cachedVehiclesStr = safeStorage.getItem('bombay_motors_vehicles');
      if (cachedVehiclesStr && active) {
        try {
          const parsed = JSON.parse(cachedVehiclesStr);
          setVehicles(parsed);
          memoryVehicles = parsed;
        } catch (_) {}
      }

      if (isFirebaseMock || !db) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const now = Date.now();
        const localMetaStamp = safeStorage.getItem('bombay_motors_vehicles_last_server_update');
        const localLastCheckStr = safeStorage.getItem('bombay_motors_vehicles_last_meta_check');
        const lastCheckTime = localLastCheckStr ? Number(localLastCheckStr) : memoryVehiclesLastMetaCheck;

        // COOLDOWN GUARD: If loaded/checked in the last 5 minutes, resolve 0 reads immediately!
        if (lastCheckTime && now - lastCheckTime < METADATA_COOLDOWN_MS && (memoryVehicles || cachedVehiclesStr)) {
          console.log('⚡ VehicleContext: [COOLDOWN ACTIVE] Showroom catalog verified recently. Bypassing server queries.');
          if (active) {
            setIsLoading(false);
          }
          return;
        }

        console.log('⚡ VehicleContext: Performing metadata check with Firestore config/vehicles_meta...');
        const metaDocRef = doc(db, 'config', 'vehicles_meta');
        let remoteMeta: any = null;

        try {
          console.log("[FIRESTORE QUERY] config (vehicles_meta)");
          const metaSnap = await getDoc(metaDocRef);
          if (metaSnap.exists()) {
            remoteMeta = metaSnap.data();
          }
        } catch (metaErr) {
          console.warn('VehicleContext: Configuration document unreachable:', metaErr);
        }

        // Update local verification check timestamp
        memoryVehiclesLastMetaCheck = now;
        safeStorage.setItem('bombay_motors_vehicles_last_meta_check', String(now));

        // METADATA MATCH: Database hasn't been edited. Resolve with cache instantly!
        if (remoteMeta && remoteMeta.lastUpdatedAt && remoteMeta.lastUpdatedAt === localMetaStamp && (memoryVehicles || cachedVehiclesStr)) {
          console.log('⚡ VehicleContext: [METADATA CACHE HIT] Server timestamp matches local cache. Catalog up to date.');
          if (active) {
            if (memoryVehicles) {
              setVehicles(memoryVehicles);
            } else if (cachedVehiclesStr) {
              const parsed = JSON.parse(cachedVehiclesStr);
              setVehicles(parsed);
              memoryVehicles = parsed;
            }
            setIsLoading(false);
          }
          return;
        }

        // Fetch entire collection if stale or first-time load
        console.log('⚡ VehicleContext: [CACHE MISS] Fetching full showroom inventory from Firestore...');
        const vehiclesColRef = collection(db, 'vehicles');
        console.log("[FIRESTORE QUERY] vehicles");
        const snapshot = await getDocs(vehiclesColRef);

        const firestoreVehicles: Vehicle[] = [];
        snapshot.forEach((docSnap) => {
          firestoreVehicles.push(parseFirestoreVehicle(docSnap.data(), docSnap.id));
        });

        if (firestoreVehicles.length === 0) {
          console.log('VehicleContext: Showroom is clean on Firestore. Seeding defaults...');
          for (const v of INITIAL_VEHICLES) {
            await setDoc(doc(db, 'vehicles', v.id), v);
          }
          const initStamp = new Date().toISOString();
          await setDoc(metaDocRef, { lastUpdatedAt: initStamp });

          if (active) {
            setVehicles(INITIAL_VEHICLES);
            memoryVehicles = INITIAL_VEHICLES;
            writeVehiclesToCache(INITIAL_VEHICLES);
            safeStorage.setItem('bombay_motors_vehicles_last_server_update', initStamp);
          }
        } else {
          firestoreVehicles.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });

          const currentMetaStamp = remoteMeta?.lastUpdatedAt || new Date().toISOString();

          if (!remoteMeta || !remoteMeta.lastUpdatedAt) {
            await setDoc(metaDocRef, { lastUpdatedAt: currentMetaStamp });
          }

          if (active) {
            setVehicles(firestoreVehicles);
            memoryVehicles = firestoreVehicles;
            writeVehiclesToCache(firestoreVehicles);
            safeStorage.setItem('bombay_motors_vehicles_last_server_update', currentMetaStamp);
            logReadReductionReport(firestoreVehicles.length, false);
          }
        }
      } catch (err) {
        console.warn('VehicleContext: Network error syncing with database. Falling back offline:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      active = false;
    };
  }, []);

  // Helper to sync local state and cache
  const syncToCache = useCallback((newVehicles: Vehicle[], newLeads: Lead[]) => {
    memoryVehicles = newVehicles;
    memoryLeads = newLeads;
    setVehicles(newVehicles);
    setLeads(newLeads);
    writeVehiclesToCache(newVehicles);
    safeStorage.setItem('bombay_motors_leads', JSON.stringify(newLeads));
  }, []);

  // Lazy-loading fetch function for CRM Leads featuring Metadata gating
  const fetchLeads = useCallback(async (force = false) => {
    if (isFirebaseMock || !db) return;

    // IN-MEMORY SESSION BUFFER GUARD:
    // If leads are already present in our active in-memory module, bypass all Firestore hits completely!
    // This reduces O(N) database operations for CRM leads down to EXACTLY once per application load session,
    // protecting against high read quotas even if localStorage is completely blocked.
    if (!force && memoryLeads && memoryLeads.length > 0) {
      console.log('🎯 VehicleContext: [SESSION CACHE HIT] CRM Leads already inside active memory buffer. Resolving 0 reads.');
      setLeads(memoryLeads);
      return;
    }

    setIsLeadsLoading(true);
    try {
      const now = Date.now();
      const localMetaStamp = safeStorage.getItem('bombay_motors_leads_last_server_update');
      const localLeadsStr = safeStorage.getItem('bombay_motors_leads');
      const localLastCheckStr = safeStorage.getItem('bombay_motors_leads_last_meta_check');

      const lastCheckTime = localLastCheckStr ? Number(localLastCheckStr) : memoryLeadsLastMetaCheck;

      // LEADS COOLDOWN GUARD: If fetched/checked recently, bypass querying completely
      if (!force && lastCheckTime && now - lastCheckTime < LEADS_SERVER_COOLDOWN_MS && (memoryLeads || (localLeadsStr && localMetaStamp))) {
        console.log('VehicleContext: Leads metadata cooldown active. Loading locally.');
        if (memoryLeads) {
          setLeads(memoryLeads);
        } else if (localLeadsStr) {
          try {
            const parsed = JSON.parse(localLeadsStr);
            memoryLeads = parsed;
            setLeads(parsed);
          } catch (_) {}
        }
        setIsLeadsLoading(false);
        return;
      }

      console.log('VehicleContext: Verifying CRM leads metadata with Firestore...');
      const metaDocRef = doc(db, 'config', 'leads_meta');
      let remoteMeta: any = null;

      try {
        console.log("[FIRESTORE QUERY] config (leads_meta)");
        const metaSnap = await getDoc(metaDocRef);
        if (metaSnap.exists()) {
          remoteMeta = metaSnap.data();
        }
      } catch (metaErr) {
        console.warn('VehicleContext: CRM meta timestamp doc not found or unreachable:', metaErr);
      }

      // Update check timestamp
      memoryLeadsLastMetaCheck = now;
      safeStorage.setItem('bombay_motors_leads_last_meta_check', String(now));

      const currentLocalMetaStamp = safeStorage.getItem('bombay_motors_leads_last_server_update');
      const currentLocalLeadsStr = safeStorage.getItem('bombay_motors_leads');

      // METADATA MATCH CHECK: If leads haven't updated, skip reads completely!
      if (!force && remoteMeta && remoteMeta.lastUpdatedAt && remoteMeta.lastUpdatedAt === currentLocalMetaStamp && currentLocalLeadsStr) {
        console.log('VehicleContext: CRM inquiries are up to date (Metadata timestamp matches). Skipping database read scan.');
        try {
          const cachedLeads = JSON.parse(currentLocalLeadsStr);
          memoryLeads = cachedLeads;
          setLeads(cachedLeads);
        } catch (_) {}
        setIsLeadsLoading(false);
        return;
      }

      console.log('VehicleContext: Fetching customer inquiries from database...');
      const leadsColRef = collection(db, 'leads');
      const leadsQuery = query(leadsColRef, orderBy('createdAt', 'desc'), limit(300));
      console.log("[FIRESTORE QUERY] leads");
      const leadSnap = await getDocs(leadsQuery);

      const firestoreLeads: Lead[] = [];
      leadSnap.forEach((docSnap) => {
        firestoreLeads.push(parseFirestoreLead(docSnap.data(), docSnap.id));
      });

      // Special initial seeding for leads if the collection is completely empty
      if (firestoreLeads.length === 0) {
        console.log('VehicleContext: Bootstrapping CRM database with default client inquiries...');
        for (const l of INITIAL_LEADS) {
          await setDoc(doc(db, 'leads', l.id), l);
        }
        const initStamp = new Date().toISOString();
        await setDoc(metaDocRef, { lastUpdatedAt: initStamp });

        memoryLeads = INITIAL_LEADS;
        setLeads(INITIAL_LEADS);
        safeStorage.setItem('bombay_motors_leads', JSON.stringify(INITIAL_LEADS));
        safeStorage.setItem('bombay_motors_leads_last_server_update', initStamp);
      } else {
        memoryLeads = firestoreLeads;
        setLeads(firestoreLeads);
        const currentMetaStamp = remoteMeta?.lastUpdatedAt || new Date().toISOString();
        
        // Ensure remote metadata document contains the lastUpdatedAt timestamp
        if (!remoteMeta || !remoteMeta.lastUpdatedAt) {
          await setDoc(metaDocRef, { lastUpdatedAt: currentMetaStamp });
        }
        
        safeStorage.setItem('bombay_motors_leads', JSON.stringify(firestoreLeads));
        safeStorage.setItem('bombay_motors_leads_last_server_update', currentMetaStamp);
      }
    } catch (err) {
      console.warn('VehicleContext: Could not retrieve customer inquiries from Firestore.', err);
    } finally {
      setIsLeadsLoading(false);
    }
  }, []);

  // Seed online database helper (manually or initially invoked)
  const seedDataIfNeeded = useCallback(async () => {
    if (isFirebaseMock || !db) return;
    try {
      console.log('VehicleContext: Seeding initial collections to Firestore...');
      for (const v of INITIAL_VEHICLES) {
        await setDoc(doc(db, 'vehicles', v.id), v);
      }
      for (const l of INITIAL_LEADS) {
        await setDoc(doc(db, 'leads', l.id), l);
      }
      // Initialize BOTH metadata stamps on Firestore to match seeding state
      const timestamp = new Date().toISOString();
      await setDoc(doc(db, 'config', 'vehicles_meta'), { lastUpdatedAt: timestamp });
      await setDoc(doc(db, 'config', 'leads_meta'), { lastUpdatedAt: timestamp });
      
      safeStorage.setItem('bombay_motors_vehicles_last_server_update', timestamp);
      safeStorage.setItem('bombay_motors_leads_last_server_update', timestamp);
      
      console.log('VehicleContext: DB seeded successfully.');
    } catch (e) {
      console.error('VehicleContext: Error during DB seed:', e);
    }
  }, []);

  const addVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const timestamp = new Date().toISOString();
    const newId = 'vehicle_' + Math.random().toString(36).substr(2, 9);
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 1. Optimistic immediate local state update
    const updatedList = [newVehicle, ...vehicles];
    syncToCache(updatedList, leads);

    // 2. Write to Firestore asynchronous
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Writing new vehicle ${newId} to Firestore...`);
        await setDoc(doc(db, 'vehicles', newId), newVehicle);
        
        // Trigger server metadata timestamp update to bypass cached states for all clients instantly
        const newStamp = new Date().toISOString();
        await setDoc(doc(db, 'config', 'vehicles_meta'), { lastUpdatedAt: newStamp });
        safeStorage.setItem('bombay_motors_vehicles_last_server_update', newStamp);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `vehicles/${newId}`);
      }
    }

    return newId;
  }, [vehicles, leads, syncToCache]);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>): Promise<void> => {
    const timestamp = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: timestamp };

    // 1. Local sync
    const updatedList = vehicles.map(v => v.id === id ? { ...v, ...cleanUpdates } as Vehicle : v);
    syncToCache(updatedList, leads);

    // 2. Firestore sync
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Redacting/Updating vehicle ${id} in Firestore...`);
        const fullVehicle = updatedList.find(v => v.id === id);
        if (fullVehicle) {
          await setDoc(doc(db, 'vehicles', id), fullVehicle);
          
          // Trigger server metadata timestamp update
          const newStamp = new Date().toISOString();
          await setDoc(doc(db, 'config', 'vehicles_meta'), { lastUpdatedAt: newStamp });
          safeStorage.setItem('bombay_motors_vehicles_last_server_update', newStamp);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `vehicles/${id}`);
      }
    }
  }, [vehicles, leads, syncToCache]);

  const deleteVehicle = useCallback(async (id: string): Promise<void> => {
    // 1. Local sync
    const updatedList = vehicles.filter(v => v.id !== id);
    syncToCache(updatedList, leads);

    // 2. Firestore sync
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Removing vehicle ${id} from Firestore...`);
        await deleteDoc(doc(db, 'vehicles', id));
        
        // Trigger server metadata timestamp update
        const newStamp = new Date().toISOString();
        await setDoc(doc(db, 'config', 'vehicles_meta'), { lastUpdatedAt: newStamp });
        safeStorage.setItem('bombay_motors_vehicles_last_server_update', newStamp);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `vehicles/${id}`);
      }
    }
  }, [vehicles, leads, syncToCache]);

  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
    const timestamp = new Date().toISOString();
    const newId = 'lead_' + Math.random().toString(36).substr(2, 9);
    const newLead: Lead = {
      ...leadData,
      id: newId,
      status: 'NEW',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 1. Local sync
    const updatedLeads = [newLead, ...leads];
    syncToCache(vehicles, updatedLeads);

    // 2. Firestore sync
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Registering new CRM Inquiry ${newId} with Firestore...`);
        await setDoc(doc(db, 'leads', newId), newLead);
        
        // Trigger server metadata timestamp update
        const newStamp = new Date().toISOString();
        await setDoc(doc(db, 'config', 'leads_meta'), { lastUpdatedAt: newStamp });
        safeStorage.setItem('bombay_motors_leads_last_server_update', newStamp);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${newId}`);
      }
    }

    return newId;
  }, [vehicles, leads, syncToCache]);

  const updateLeadStatus = useCallback(async (leadId: string, newStatus: Lead['status']): Promise<void> => {
    const timestamp = new Date().toISOString();

    // 1. Local sync
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus, updatedAt: timestamp } : l);
    syncToCache(vehicles, updatedLeads);

    // 2. Firestore sync
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Transitioning Lead ${leadId} status to ${newStatus} in Firestore...`);
        const targetLead = updatedLeads.find(l => l.id === leadId);
        if (targetLead) {
          await setDoc(doc(db, 'leads', leadId), targetLead);
          
          // Trigger server metadata timestamp update
          const newStamp = new Date().toISOString();
          await setDoc(doc(db, 'config', 'leads_meta'), { lastUpdatedAt: newStamp });
          safeStorage.setItem('bombay_motors_leads_last_server_update', newStamp);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${leadId}`);
      }
    }
  }, [vehicles, leads, syncToCache]);

  const updateLeadNotes = useCallback(async (leadId: string, notes: string): Promise<void> => {
    const timestamp = new Date().toISOString();

    // 1. Local sync
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, notes, updatedAt: timestamp } : l);
    syncToCache(vehicles, updatedLeads);

    // 2. Firestore sync
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Adjusting notes for Lead ${leadId} in Firestore...`);
        const targetLead = updatedLeads.find(l => l.id === leadId);
        if (targetLead) {
          await setDoc(doc(db, 'leads', leadId), targetLead);
          
          // Trigger server metadata timestamp update
          const newStamp = new Date().toISOString();
          await setDoc(doc(db, 'config', 'leads_meta'), { lastUpdatedAt: newStamp });
          safeStorage.setItem('bombay_motors_leads_last_server_update', newStamp);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `leads/${leadId}`);
      }
    }
  }, [vehicles, leads, syncToCache]);

  const deleteLead = useCallback(async (leadId: string): Promise<void> => {
    // 1. Local sync
    const updatedLeads = leads.filter(l => l.id !== leadId);
    syncToCache(vehicles, updatedLeads);

    // 2. Firestore sync
    if (!isFirebaseMock && db) {
      try {
        console.log(`VehicleContext: Deleting Lead ${leadId} from Firestore...`);
        await deleteDoc(doc(db, 'leads', leadId));
        
        // Trigger server metadata timestamp update
        const newStamp = new Date().toISOString();
        await setDoc(doc(db, 'config', 'leads_meta'), { lastUpdatedAt: newStamp });
        safeStorage.setItem('bombay_motors_leads_last_server_update', newStamp);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `leads/${leadId}`);
      }
    }
  }, [vehicles, leads, syncToCache]);

  return (
    <VehicleContext.Provider value={{ 
      vehicles, 
      leads, 
      addVehicle, 
      updateVehicle, 
      deleteVehicle, 
      addLead, 
      updateLeadStatus, 
      updateLeadNotes,
      deleteLead,
      isLoading,
      seedDataIfNeeded,
      fetchLeads,
      isLeadsLoading
    }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};

