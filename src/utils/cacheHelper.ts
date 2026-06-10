/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle } from '../types';

/**
 * Calculates the exact byte format sizes of any serializable object.
 */
export function getPayloadSize(data: any): { bytes: number; kb: number; mb: number } {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    const bytes = new TextEncoder().encode(str).length;
    return {
      bytes,
      kb: bytes / 1024,
      mb: bytes / (1024 * 1024)
    };
  } catch (error) {
    console.error('getPayloadSize: Failed to serialize data for size measurement.', error);
    return { bytes: 0, kb: 0, mb: 0 };
  }
}

/**
 * Strips base64 data, image blobs, long descriptions, inspection notes,
 * and other large non-essential fields to create a lightweight vehicle list for caching.
 */
export function sanitizeVehiclesForCache(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map(v => {
    // Exclude image blobs and base64 strings, keeping only valid HTTP/HTTPS URLs < 500 chars to avoid cache bloating
    const cleanImages = (v.images || []).filter(img => {
      if (!img) return false;
      const isBase64 = img.startsWith('data:');
      const isBlob = img.startsWith('blob:');
      const isTooLong = img.length > 500;
      return !isBase64 && !isBlob && !isTooLong;
    });

    return {
      ...v,
      images: cleanImages,
      // Truncate long descriptions (crucial for lightweight listing data)
      description: v.description && v.description.length > 150 
        ? v.description.substring(0, 150) + '...' 
        : (v.description || ''),
      // Truncate inspection notes
      inspectionNotes: v.inspectionNotes && v.inspectionNotes.length > 100 
        ? v.inspectionNotes.substring(0, 100) + '...' 
        : (v.inspectionNotes || ''),
      // Trim features array to a max of 5 elements if bloated
      features: Array.isArray(v.features) ? v.features.slice(0, 5) : [],
    };
  });
}

/**
 * Identifies which fields in the unsanitized vehicles array consume the most space.
 * Logs a detailed breakdown to the console.
 */
export function analyzeSpaceConsumption(vehicles: Vehicle[]): void {
  let totalImagesBytes = 0;
  let totalDescBytes = 0;
  let totalNotesBytes = 0;
  let totalFeaturesBytes = 0;
  let otherBytes = 0;

  // Find the single largest vehicle and its components to log
  let largestVehicleId = '';
  let largestVehicleSize = 0;
  let base64Count = 0;

  vehicles.forEach(v => {
    const imagesStr = JSON.stringify(v.images || []);
    const descStr = v.description || '';
    const notesStr = v.inspectionNotes || '';
    const featuresStr = JSON.stringify(v.features || []);

    const imagesSize = getPayloadSize(imagesStr).bytes;
    const descSize = getPayloadSize(descStr).bytes;
    const notesSize = getPayloadSize(notesStr).bytes;
    const featuresSize = getPayloadSize(featuresStr).bytes;

    const totalVSize = getPayloadSize(v).bytes;

    totalImagesBytes += imagesSize;
    totalDescBytes += descSize;
    totalNotesBytes += notesSize;
    totalFeaturesBytes += featuresSize;

    if (totalVSize > largestVehicleSize) {
      largestVehicleSize = totalVSize;
      largestVehicleId = `${v.make} ${v.model} (ID: ${v.id})`;
    }

    // Count base64 values
    (v.images || []).forEach(img => {
      if (img && (img.startsWith('data:') || img.length > 500)) {
        base64Count++;
      }
    });
  });

  const totalBytes = getPayloadSize(vehicles).bytes;
  otherBytes = totalBytes - (totalImagesBytes + totalDescBytes + totalNotesBytes + totalFeaturesBytes);

  console.log('=== VEHICLE SHOWROOM CACHE SPACE ANALYSIS ===');
  console.log(`Total Unsanitized Catalog Size: ${(totalBytes / 1024).toFixed(2)} KB (${(totalBytes / (1024 * 1024)).toFixed(3)} MB)`);
  console.log(`- Images Size: ${(totalImagesBytes / 1024).toFixed(2)} KB (${(totalImagesBytes / (1024 * 1024)).toFixed(3)} MB) | ${((totalImagesBytes / (totalBytes || 1)) * 100).toFixed(1)}% of total`);
  console.log(`  └ Detected ${base64Count} base64/bloated image strings.`);
  console.log(`- Description Field Size: ${(totalDescBytes / 1024).toFixed(2)} KB (${(totalDescBytes / (1024 * 1024)).toFixed(3)} MB) | ${((totalDescBytes / (totalBytes || 1)) * 100).toFixed(1)}% of total`);
  console.log(`- Inspection Notes Field Size: ${(totalNotesBytes / 1024).toFixed(2)} KB (${(totalNotesBytes / (1024 * 1024)).toFixed(3)} MB) | ${((totalNotesBytes / (totalBytes || 1)) * 100).toFixed(1)}% of total`);
  console.log(`- Features List Field Size: ${(totalFeaturesBytes / 1024).toFixed(2)} KB (${(totalFeaturesBytes / (1024 * 1024)).toFixed(3)} MB) | ${((totalFeaturesBytes / (totalBytes || 1)) * 100).toFixed(1)}% of total`);
  console.log(`- Core fields (IDs, Makes, Models, Prices, etc.): ${(otherBytes / 1024).toFixed(2)} KB (${(otherBytes / (1024 * 1024)).toFixed(3)} MB) | ${((otherBytes / (totalBytes || 1)) * 100).toFixed(1)}% of total`);
  console.log(`Largest Vehicle Record in memory: ${largestVehicleId} occupying ${(largestVehicleSize / 1024).toFixed(2)} KB (${(largestVehicleSize / (1024 * 1024)).toFixed(3)} MB)`);
  console.log('============================================');
}

/**
 * Safely serializes and writes the vehicle inventory to localStorage with transactional validation checks.
 */
export function writeVehiclesToCache(vehicles: Vehicle[]): boolean {
  try {
    // 1. Perform a space analysis prior to sanitization
    analyzeSpaceConsumption(vehicles);

    // 2. Extreme sanitization removing bloated formats (base64/blobs) and high character count metadata
    const sanitized = sanitizeVehiclesForCache(vehicles);

    // 3. Measure exact serialized sizes
    const beforeSize = getPayloadSize(vehicles);
    const afterSize = getPayloadSize(sanitized);
    const serializedStr = JSON.stringify(sanitized);

    console.log('=== VEHICLE CACHE WRITE INITIATION ===');
    console.log(`Unsanitized Payload: ${beforeSize.kb.toFixed(2)} KB (${beforeSize.mb.toFixed(3)} MB)`);
    console.log(`Sanitized Cache Payload: ${afterSize.kb.toFixed(2)} KB (${afterSize.mb.toFixed(3)} MB)`);
    console.log(`💾 Compaction space savings: +${(100 - (afterSize.bytes / (beforeSize.bytes || 1)) * 100).toFixed(1)}% reduced footprint`);

    // 4. Try-catch block specifically bound to localStorage
    try {
      localStorage.setItem('bombay_motors_vehicles', serializedStr);
    } catch (storageError: any) {
      console.error('❌ VehicleContext: safeStorage write failure. Broader storage quota is full.', storageError);
      return false;
    }

    // 5. Deep validator readback verification
    const readbackStr = localStorage.getItem('bombay_motors_vehicles');
    if (readbackStr && readbackStr === serializedStr) {
      console.log('✅ VehicleContext: bombay_motors_vehicles SUCCESSFULLY written to localStorage and verified.');
      return true;
    } else {
      console.warn('❌ VehicleContext: Cache write verification mismatch or was immediately deleted.');
      return false;
    }
  } catch (err: any) {
    console.error('❌ VehicleContext: Fatal error caught inside writeVehiclesToCache utility:', err);
    return false;
  }
}

/**
 * Outputs a clear estimate of Firestore database reads saved.
 */
export function logReadReductionReport(vehicleCount: number, cacheHit: boolean): void {
  // A Firestore scan reads N vehicles + 1 metadata document = N + 1 database read units.
  // A metadata check / cache hit only reads 1 metadata document (or 0 document reads if memory checked).
  const fullReadsNoCache = vehicleCount + 1;
  const readsWithCache = cacheHit ? 1 : fullReadsNoCache;
  const savedReads = fullReadsNoCache - readsWithCache;

  console.log('=== FIRESTORE METRICS SAVINGS REPORT ===');
  console.log(`Total Showroom Inventory size: ${vehicleCount} items`);
  console.log(`Estimated Firestore Reads (NO CACHE): ${fullReadsNoCache} units`);
  console.log(`Actual Firestore Reads (WITH ACTIVE CACHE): ${readsWithCache} units`);
  console.log(`🚀 Quota Savings achieved: +${savedReads} document read units saved (${((savedReads / fullReadsNoCache) * 100).toFixed(1)}% reduction)`);
  console.log('========================================');
}
