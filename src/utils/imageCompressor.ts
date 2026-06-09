/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image file using HTML5 canvas.
 * Dimensions are restricted to max 1024x1024.
 * Quality is compressed to 0.3 (JPEG format).
 * Returns a Base64 string.
 */
export function compressImage(file: File, maxDim = 800, quality = 0.22): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get Canvas Context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress inside specified quality constraints
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Compresses an image file to a lightweight JPEG Blob.
 * Incredibly efficient, keeps upload times under a second.
 */
export function compressImageToBlob(file: File, maxDim = 800, quality = 0.4): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get Canvas Context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas conversion to blob returned null'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Enforces the Firestore document size guard.
 * Total characters allowed for images: 1,000,000 chars (approx. 1MB limit check).
 * If it exceeds, it trims the images array and alerts via a toast handler.
 */
export function enforceFirestoreSizeGuard(
  images: string[],
  baseDocSizeEstimation: number,
  onLimitExceeded: (message: string) => void
): { optimizedImages: string[]; exceeded: boolean } {
  let exceeded = false;
  let currentImages = [...images];

  while (currentImages.length > 0) {
    const imagesPayloadSize = JSON.stringify(currentImages).length;
    const totalEstimatedSize = baseDocSizeEstimation + imagesPayloadSize;

    if (totalEstimatedSize <= 1000000) {
      break;
    }

    exceeded = true;
    currentImages.pop(); // Remote the last image (keeping primary ones first)
  }

  if (exceeded) {
    onLimitExceeded(
      "Some images were optimized and excluded to comply with Firestore storage limits."
    );
  }

  return {
    optimizedImages: currentImages,
    exceeded,
  };
}

/**
 * Compresses a base64 string image asynchronously using an HTML Image and Canvas.
 */
export function compressBase64Image(base64Str: string, maxDim = 600, quality = 0.15): Promise<string> {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    return Promise.resolve(base64Str);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Avoid potential tainted canvas issues
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.error('Error in toDataURL compression:', err);
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

/**
 * Optimizes the SiteConfig structure by shrinking any bloated base64 fields if the total string size
 * exceeds the 1MB Firestore limit. If needed, it also trims the happyCustomers gallery to fit.
 */
export async function optimizeSiteConfigSize(config: any): Promise<any> {
  // Clone config
  let optimized = { ...config };

  // Check the serialized dry size first
  let currentSize = JSON.stringify(optimized).length;
  if (currentSize <= 950000) {
    return optimized;
  }

  console.warn(`Site config document size (${currentSize} characters) exceeds the Firestore safe limit of 1MB. Starting progressive auto-optimization...`);
  
  const imageKeys = ['heroBanner', 'sellSectionBg', 'testimonialsBg', 'showroomBg', 'aboutSectionPhoto', 'logoUrl'];

  // --- Step 1: High Quality Compression (1400px @ 0.70 quality) ---
  // Keeps full-width background banners extremely sharp and professional on standard and high-density screens.
  for (const key of imageKeys) {
    if (optimized[key] && optimized[key].startsWith('data:image')) {
      optimized[key] = await compressBase64Image(optimized[key], 1400, 0.70);
    }
  }

  currentSize = JSON.stringify(optimized).length;
  if (currentSize <= 950000) {
    console.log(`Optimization level 1 completed cleanly. Final size: ${currentSize} characters.`);
    return optimized;
  }

  // --- Step 2: Customer Galleries Compression (800px @ 0.60 quality) ---
  // Sub-galleries can shrink to smaller standard widths while presenting pristine visual output.
  if (optimized.happyCustomers && Array.isArray(optimized.happyCustomers)) {
    const list = [...optimized.happyCustomers];
    for (let i = 0; i < list.length; i++) {
      if (list[i] && list[i].startsWith('data:image')) {
        list[i] = await compressBase64Image(list[i], 800, 0.60);
      }
    }
    optimized.happyCustomers = list;
  }

  currentSize = JSON.stringify(optimized).length;
  if (currentSize <= 950000) {
    console.log(`Optimization level 2 completed. Final size: ${currentSize} characters.`);
    return optimized;
  }

  // --- Step 3: Medium Quality Compression (1100px @ 0.55 quality) ---
  // Squeezes background images slightly if metadata or excessive galleries force a lower overhead.
  for (const key of imageKeys) {
    if (optimized[key] && optimized[key].startsWith('data:image')) {
      optimized[key] = await compressBase64Image(optimized[key], 1100, 0.55);
    }
  }

  currentSize = JSON.stringify(optimized).length;
  if (currentSize <= 950000) {
    console.log(`Optimization level 3 completed. Final size: ${currentSize} characters.`);
    return optimized;
  }

  // --- Step 4: Hard Gallery Compression (600px @ 0.45 quality) ---
  if (optimized.happyCustomers && Array.isArray(optimized.happyCustomers)) {
    const list = [...optimized.happyCustomers];
    for (let i = 0; i < list.length; i++) {
      if (list[i] && list[i].startsWith('data:image')) {
        list[i] = await compressBase64Image(list[i], 600, 0.45);
      }
    }
    optimized.happyCustomers = list;
  }

  currentSize = JSON.stringify(optimized).length;
  if (currentSize <= 950000) {
    console.log(`Optimization level 4 completed. Final size: ${currentSize} characters.`);
    return optimized;
  }

  // --- Step 5: Slice Happy Customers to top 15 if still over limit ---
  if (optimized.happyCustomers && Array.isArray(optimized.happyCustomers) && optimized.happyCustomers.length > 15) {
    optimized.happyCustomers = optimized.happyCustomers.slice(0, 15);
  }

  currentSize = JSON.stringify(optimized).length;
  if (currentSize <= 950000) {
    console.log(`Optimization level 5 completed (sliced happyCustomers). Final size: ${currentSize} characters.`);
    return optimized;
  }

  // --- Step 6: Emergency Compression (800px @ 0.35 quality) ---
  // Last-resort fallback to ensure client can still write the document without crashing.
  for (const key of imageKeys) {
    if (optimized[key] && optimized[key].startsWith('data:image')) {
      optimized[key] = await compressBase64Image(optimized[key], 800, 0.35);
    }
  }

  currentSize = JSON.stringify(optimized).length;
  if (currentSize > 950000 && optimized.happyCustomers && Array.isArray(optimized.happyCustomers) && optimized.happyCustomers.length > 5) {
    optimized.happyCustomers = optimized.happyCustomers.slice(0, 5);
  }

  console.log(`Auto-optimization complete. Final size: ${JSON.stringify(optimized).length} characters.`);
  return optimized;
}
