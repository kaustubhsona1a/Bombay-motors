/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Lead } from '../types';
import { INITIAL_VEHICLES } from '../data/mockVehicles';
import { INITIAL_LEADS } from '../data/mockLeads';
import { db, isFirebaseMock, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';

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
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load data
  useEffect(() => {
    if (isFirebaseMock || !db) {
      // Mock Storage Engine with high fidelity
      const localVehiclesStr = localStorage.getItem('bombay_motors_vehicles');
      const localLeadsStr = localStorage.getItem('bombay_motors_leads');

      let localVehicles = INITIAL_VEHICLES;
      let localLeads = INITIAL_LEADS;

      if (localVehiclesStr) {
        localVehicles = JSON.parse(localVehiclesStr);
      } else {
        localStorage.setItem('bombay_motors_vehicles', JSON.stringify(INITIAL_VEHICLES));
      }

      if (localLeadsStr) {
        localLeads = JSON.parse(localLeadsStr);
      } else {
        localStorage.setItem('bombay_motors_leads', JSON.stringify(INITIAL_LEADS));
      }

      setVehicles(localVehicles);
      setLeads(localLeads);
      setIsLoading(false);
      return;
    }

    // Live Firebase Engine: Vehicles stream
    const unsubscribeVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      const items: Vehicle[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Vehicle);
      });
      // Sort client-side descending by createdAt
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setVehicles(items);
      setIsLoading(false);
    }, (error) => {
      console.warn('Vehicles collection stream failed or rule locked:', error);
      // Fallback to local storage for previews so user isn't locked out of browsing
      const localVehicles = localStorage.getItem('bombay_motors_vehicles');
      if (localVehicles) setVehicles(JSON.parse(localVehicles));
      setIsLoading(false);
    });

    // Live Firebase Engine: Leads stream
    const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const items: Lead[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Lead);
      });
      // Sort client-side descending by createdAt
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setLeads(items);
    }, (error) => {
      console.warn('Leads collection stream failed or rule locked:', error);
      const localLeads = localStorage.getItem('bombay_motors_leads');
      if (localLeads) setLeads(JSON.parse(localLeads));
    });

    // Auto-seed if running on live environment but collections are blank
    seedDataIfNeeded();

    return () => {
      unsubscribeVehicles();
      unsubscribeLeads();
    };
  }, []);

  // Helper to sync mock state to local storage
  const syncMockToLocalStorage = (newVehicles: Vehicle[], newLeads: Lead[]) => {
    setVehicles(newVehicles);
    setLeads(newLeads);
    localStorage.setItem('bombay_motors_vehicles', JSON.stringify(newVehicles));
    localStorage.setItem('bombay_motors_leads', JSON.stringify(newLeads));
  };

  // Seed online database if empty and requested
  const seedDataIfNeeded = async () => {
    if (isFirebaseMock || !db) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      if (querySnapshot.empty) {
        console.log('Seeding firestore with initial luxury stock...');
        for (const vehicle of INITIAL_VEHICLES) {
          const docRef = doc(db, 'vehicles', vehicle.id);
          await setDoc(docRef, vehicle);
        }
        for (const lead of INITIAL_LEADS) {
          const docRef = doc(db, 'leads', lead.id);
          await setDoc(docRef, lead);
        }
      }
    } catch (e) {
      console.warn('Seeding firestore ignored or failed due to permission rules:', e);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const timestamp = new Date().toISOString();
    const newId = 'vehicle_' + Math.random().toString(36).substr(2, 9);
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (isFirebaseMock || !db) {
      const updatedList = [newVehicle, ...vehicles];
      syncMockToLocalStorage(updatedList, leads);
      return newId;
    }

    try {
      // In firestore, use addDoc or secure setDoc
      await setDoc(doc(db, 'vehicles', newId), newVehicle);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vehicles/${newId}`);
      return '';
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<void> => {
    const timestamp = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: timestamp };

    if (isFirebaseMock || !db) {
      const updatedList = vehicles.map(v => v.id === id ? { ...v, ...cleanUpdates } as Vehicle : v);
      syncMockToLocalStorage(updatedList, leads);
      return;
    }

    try {
      const ref = doc(db, 'vehicles', id);
      await updateDoc(ref, cleanUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  };

  const deleteVehicle = async (id: string): Promise<void> => {
    if (isFirebaseMock || !db) {
      const updatedList = vehicles.filter(v => v.id !== id);
      syncMockToLocalStorage(updatedList, leads);
      return;
    }

    try {
      const ref = doc(db, 'vehicles', id);
      await deleteDoc(ref);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
    const timestamp = new Date().toISOString();
    const newId = 'lead_' + Math.random().toString(36).substr(2, 9);
    const newLead: Lead = {
      ...leadData,
      id: newId,
      status: 'NEW',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (isFirebaseMock || !db) {
      const updatedLeads = [newLead, ...leads];
      syncMockToLocalStorage(vehicles, updatedLeads);
      return newId;
    }

    try {
      await setDoc(doc(db, 'leads', newId), newLead);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `leads/${newId}`);
      return '';
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']): Promise<void> => {
    const timestamp = new Date().toISOString();
    if (isFirebaseMock || !db) {
      const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus, updatedAt: timestamp } : l);
      syncMockToLocalStorage(vehicles, updatedLeads);
      return;
    }

    try {
      const ref = doc(db, 'leads', leadId);
      await updateDoc(ref, { status: newStatus, updatedAt: timestamp });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string): Promise<void> => {
    const timestamp = new Date().toISOString();
    if (isFirebaseMock || !db) {
      const updatedLeads = leads.map(l => l.id === leadId ? { ...l, notes: notes, updatedAt: timestamp } : l);
      syncMockToLocalStorage(vehicles, updatedLeads);
      return;
    }

    try {
      const ref = doc(db, 'leads', leadId);
      await updateDoc(ref, { notes, updatedAt: timestamp });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
    }
  };

  const deleteLead = async (leadId: string): Promise<void> => {
    if (isFirebaseMock || !db) {
      const updatedLeads = leads.filter(l => l.id !== leadId);
      syncMockToLocalStorage(vehicles, updatedLeads);
      return;
    }

    try {
      const ref = doc(db, 'leads', leadId);
      await deleteDoc(ref);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${leadId}`);
    }
  };

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
      seedDataIfNeeded
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
