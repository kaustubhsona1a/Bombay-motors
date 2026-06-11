/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

let firebaseApp: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let isFirebaseMock = true;

// Check if the current config is a placeholder mock
if (firebaseConfig.apiKey === 'mock-api-key-bombay-motors' || !firebaseConfig.apiKey) {
  console.warn('Firebase is running in Demo Mock Mode because terms of service or setup is not complete yet.');
} else {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    db = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    isFirebaseMock = false;
    console.log('Live Firebase initialized successfully with Firestore and Firebase Storage.');
  } catch (err) {
    console.warn('Failed to initialize live Firebase, falling back to mock storage.', err);
  }
}

// Convert data URI / Base64 to Blob
export function dataURLtoBlob(dataurl: string): Blob {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('Failed to convert dataURL to Blob:', err);
    throw err;
  }
}

// Convert a Blob or File to a Data URL (Base64)
export function blobToDataURL(blobOrFile: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blobOrFile);
  });
}

// Upload a file or blob to Firebase Storage and return its public download URL.
// Relies on a 1.5-second timeout. If it times out or fails (e.g. no storage bucket),
// falls back instantly to return a highly-compressed inline Base64 data URL.
export async function uploadImageToStorage(blobOrFile: Blob | File, path: string): Promise<string> {
  if (isFirebaseMock || !storage) {
    return blobToDataURL(blobOrFile);
  }

  const uploadPromise = (async () => {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, blobOrFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  })();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firebase Storage upload timed out after 1.5 seconds')), 1500)
  );

  try {
    const url = await Promise.race([uploadPromise, timeoutPromise]);
    return url;
  } catch (err) {
    console.warn(
      'Firebase Storage is unavailable, not set up/activated, or timed out. Falling back to inline compressed Base64 format.',
      err
    );
    return blobToDataURL(blobOrFile);
  }
}

// Custom error handler formatting as per spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'anonymous_or_mock',
      email: auth?.currentUser?.email || 'mock_user@gmail.com',
      emailVerified: auth?.currentUser?.emailVerified || true,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { firebaseApp, db, auth, storage, isFirebaseMock };
