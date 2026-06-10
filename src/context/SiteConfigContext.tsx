/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteConfig } from '../types';
import { db, isFirebaseMock, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

// Cooldown of 12 hours for site config fetch to save premium/free read units
const CACHE_COOLDOWN_MS = 12 * 60 * 60 * 1000;

// Module-level in-memory state fallbacks to bypass localStorage lookup failures and guard against bot traversal patterns
let memorySiteConfigCache: SiteConfig | null = null;
let memorySiteConfigLastFetch: number | null = null;

// Ultra-safe storage wrappers to handle sandboxed iframe storage access blocks gracefully
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (_) {}
};

interface SiteConfigContextType {
  siteConfig: SiteConfig;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  isLoading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    if (memorySiteConfigCache) return memorySiteConfigCache;
    const saved = safeGetItem('bombay_motors_site_config');
    return saved ? JSON.parse(saved) : DEFAULT_SITE_CONFIG;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      // If we are in mock mode, there's no live db connection
      if (isFirebaseMock || !db) {
        setIsLoading(false);
        return;
      }

      // Read-optimization: Check if we have fetched recently
      const lastFetchedStr = safeGetItem('bombay_motors_site_config_last_fetch');
      const now = Date.now();
      const lastFetched = lastFetchedStr ? Number(lastFetchedStr) : memorySiteConfigLastFetch;

      // Check both local storage AND in-memory cooldown fallback
      if (lastFetched && now - lastFetched < CACHE_COOLDOWN_MS) {
        if (memorySiteConfigCache) {
          setSiteConfig(memorySiteConfigCache);
        } else if (lastFetchedStr) {
          const saved = safeGetItem('bombay_motors_site_config');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              memorySiteConfigCache = parsed;
              setSiteConfig(parsed);
            } catch (_) {}
          }
        }
        console.log('SiteConfig: Loading cached version to protect reads (cooldown active). 0 queries executed.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('SiteConfig: Performing background Firestore fetch for global operational configurations...');
        const configDocRef = doc(db, 'site_config', 'global');
        const docSnap = await getDoc(configDocRef);

        if (docSnap.exists()) {
          const remoteConfig = docSnap.data().config as SiteConfig;
          if (remoteConfig) {
            setSiteConfig(remoteConfig);
            memorySiteConfigCache = remoteConfig;
            memorySiteConfigLastFetch = now;
            safeSetItem('bombay_motors_site_config', JSON.stringify(remoteConfig));
            safeSetItem('bombay_motors_site_config_last_fetch', String(now));
          }
        } else {
          // If the config doesn't exist in live Firestore yet, save our current active configuration to seed it
          console.log('SiteConfig: Seed configuration doc not found on Firestore. Uploading default setup.');
          await setDoc(configDocRef, { config: siteConfig });
          memorySiteConfigCache = siteConfig;
          memorySiteConfigLastFetch = now;
          safeSetItem('bombay_motors_site_config_last_fetch', String(now));
        }
      } catch (err: any) {
        console.warn('Could not load site configuration from live Firestore (quota or setup). Operating on cached copy.', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateSiteConfig = useCallback(async (newConfig: Partial<SiteConfig>) => {
    let merged = { ...siteConfig, ...newConfig };

    // Asynchronously optimize document size if it contains oversized base64 images to prevent size limits
    try {
      const { optimizeSiteConfigSize } = await import('../utils/imageCompressor');
      merged = await optimizeSiteConfigSize(merged);
    } catch (compressErr) {
      console.warn('Could not optimize site config size:', compressErr);
    }

    setSiteConfig(merged);
    memorySiteConfigCache = merged;
    safeSetItem('bombay_motors_site_config', JSON.stringify(merged));

    if (!isFirebaseMock && db) {
      const path = 'site_config/global';
      try {
        console.log('SiteConfig: Updating configurations document to Firestore...');
        await setDoc(doc(db, 'site_config', 'global'), { config: merged });
        memorySiteConfigLastFetch = Date.now();
        safeSetItem('bombay_motors_site_config_last_fetch', String(Date.now()));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  }, [siteConfig]);

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
