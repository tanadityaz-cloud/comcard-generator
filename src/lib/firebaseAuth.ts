import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as fbSignOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider configured with Google Drive scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in in progress
let isSigningIn = false;

// In-memory cache for the OAuth access token (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

// Listeners for popup blocked event
type PopupBlockedListener = (isBlocked: boolean) => void;
let popupBlockedListeners: PopupBlockedListener[] = [];

export const subscribePopupBlocked = (listener: PopupBlockedListener): (() => void) => {
  popupBlockedListeners.push(listener);
  return () => {
    popupBlockedListeners = popupBlockedListeners.filter((l) => l !== listener);
  };
};

export const setPopupBlocked = (isBlocked: boolean) => {
  popupBlockedListeners.forEach((listener) => listener(isBlocked));
};

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is logged in but we don't have the memory access token,
        // trigger sign-in with popup when user wants to do Drive actions
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token for Google Drive
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    setPopupBlocked(false);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error?.code === 'auth/popup-blocked' || error?.message?.includes('popup-blocked')) {
      setPopupBlocked(true);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve the current in-memory access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out and clear cached token
 */
export const googleSignOut = async (): Promise<void> => {
  await fbSignOut(auth);
  cachedAccessToken = null;
};
