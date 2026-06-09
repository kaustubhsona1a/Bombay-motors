/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
  transmission: 'Automatic' | 'Manual';
  exteriorColor: string;
  interiorColor: string;
  price: number; // In Lakhs or absolute INR (we will display appropriately, e.g. 15.5 Lakh)
  mileage: number; // Kilometers driven
  ownerCount: number; // 1st owner, 2nd owner, etc.
  registration: string; // e.g. MH-03-EK-1234
  description: string;
  features: string[];
  inspectionNotes: string;
  status: 'active' | 'reserved' | 'sold' | 'archived';
  images: string[]; // Compressed Base64 strings or image links
  createdAt: string; 
  updatedAt: string;
  isFeatured: boolean;
}

export type FuelType = Vehicle['fuelType'];
export type TransmissionType = Vehicle['transmission'];
export type VehicleStatus = Vehicle['status'];

export interface Lead {
  id: string;
  vehicleId?: string | null;
  vehicleName?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: 'BUY_INQUIRY' | 'SELL_INQUIRY' | 'GENERAL_INQUIRY';
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATING' | 'BOOKED' | 'SOLD' | 'CLOSED';
  preferredContactMethod: 'WhatsApp' | 'Phone' | 'Email';
  notes: string;
  expectedPrice?: number;
  sellCarDetails?: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    ownership: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = Lead['status'];
export type LeadType = Lead['type'];

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
}

export interface SiteConfig {
  storeName: string;
  address: string;
  phone: string;
  whatsApp: string;
  instagram: string;
  businessHours: string;
  footerText: string;
  legalNotes: string;
  logoUrl?: string;
  heroBanner?: string;
  sellSectionBg?: string;
  testimonialsBg?: string;
  showroomBg?: string;
  aboutSectionPhoto?: string;
  aboutSubtitle?: string;
  aboutHeroTitle?: string;
  aboutDescription?: string;
  aboutStory?: string;
  happyCustomers?: string[];
  googleRating?: number;
  reviewsCount?: number;
  googleMapsUrl?: string;
  googleReviewsUrl?: string;
}

export interface InventoryFilters {
  search: string;
  make: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  ownerCount: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  maxMileage: number;
  color: string;
}

export interface DashboardMetrics {
  totalVehicles: number;
  activeInventory: number;
  soldVehicles: number;
  openLeads: number;
  portfolioValue: number; // In Lakhs or absolute sum
}
