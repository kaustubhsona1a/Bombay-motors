/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig } from '../types';
import { db, isFirebaseMock, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_SITE_CONFIG: SiteConfig = {
  storeName: "Bombay Motors",
  address: "1-A, Ekta Apartment, L.B.S. Marg, Mulund West, Opposite Santoshimata Mandir, Mumbai, Maharashtra 400080",
  phone: "+91 93226 75056",
  whatsApp: "+91 93226 75056",
  instagram: "bombaymotorss",
  businessHours: "MON-SUN: 10AM - 8:30PM",
  footerText: "© 2026 Bombay Motors. Built with perfection. All rights reserved.",
  legalNotes: "Bombay Motors is an independent pre-owned premium car dealer and has no formal association, affiliation or rights with any automotive brands mentioned.",
  logoUrl: "",
  heroBanner: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1600",
  sellSectionBg: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1600",
  testimonialsBg: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1600",
  showroomBg: "https://images.unsplash.com/photo-1562591176-b3336ee36417?auto=format&fit=crop&q=80&w=1600",
  aboutSectionPhoto: "https://images.unsplash.com/photo-1562591176-b3336ee36417?auto=format&fit=crop&q=80&w=1200",
  aboutSubtitle: "Mumbai's highly trusted destination for certified, high-quality family hatchbacks, SUVs, and sedans on L.B.S. Marg, Mulund West.",
  aboutHeroTitle: "YOUR FAMILY’S SAFEST & MOST RELIABLE DRIVE RUNS HERE",
  aboutDescription: "At Bombay Motors, we understand that buying a pre-owned car is a milestone for your family. We are not interested in overhyping luxury. Instead, we focus on delivering high-quality, practical mass-market family cars—like Toyota, Hyundai, Maruti Suzuki, Honda, and Tata—at honest, transparent prices. Every family car in our inventory opposing Santoshimata Mandir undergoes an exhaustive multi-point inspection check covering engine longevity, safety airbags, braking efficiency, and complete structural integrity so your loved ones remain safe.",
  aboutStory: "We specialize in providing a 100% hassle-free buying experience. From certified on-road quality verification to swift RTO paper transfers and low-interest bank loan tie-ups, Bombay Motors handles every little detail. Your satisfaction and family's smiles are our business's true engine.",
  happyCustomers: [
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"
  ],
  googleRating: 4.3,
  reviewsCount: 109,
  googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Bombay+Motors+Ekta+Apartment+LBS+Marg+Mulund+West+Mumbai",
  googleReviewsUrl: "https://search.google.com/local/reviews?placeid=ChIJSV7H-MTEzzsRC0aI03x7Oig"
};

interface SiteConfigContextType {
  siteConfig: SiteConfig;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  isLoading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('bombay_motors_site_config');
    return saved ? JSON.parse(saved) : DEFAULT_SITE_CONFIG;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseMock || !db) {
      setIsLoading(false);
      return;
    }

    const configDocRef = doc(db, 'site_config', 'global');

    // Subscribe to real-time changes
    const unsubscribe = onSnapshot(configDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteConfig;
        setSiteConfig(data);
        localStorage.setItem('bombay_motors_site_config', JSON.stringify(data));
      }
      setIsLoading(false);
    }, (error) => {
      // Gracefully catch and handle firebase snapshot permissions/errors
      console.warn('Firestore snapshot error for site settings:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
    let merged = { ...siteConfig, ...newConfig };

    // Asynchronously optimize document size if it contains oversized base64 images to prevent Firestore errors
    try {
      const { optimizeSiteConfigSize } = await import('../utils/imageCompressor');
      merged = await optimizeSiteConfigSize(merged);
    } catch (compressErr) {
      console.warn('Could not optimize site config size asynchronously:', compressErr);
    }

    setSiteConfig(merged);
    localStorage.setItem('bombay_motors_site_config', JSON.stringify(merged));

    if (!isFirebaseMock && db) {
      try {
        const configDocRef = doc(db, 'site_config', 'global');
        await setDoc(configDocRef, merged);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'site_config/global');
      }
    }
  };

  return (
    <SiteConfigContext.Provider value={{ siteConfig, updateSiteConfig, isLoading }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
