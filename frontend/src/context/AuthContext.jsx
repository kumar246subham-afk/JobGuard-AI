import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured 
} from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  updateProfile 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local session check
      const localUser = localStorage.getItem("jobguard_guest_user");
      if (localUser) {
        try {
          setUser(JSON.parse(localUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please supply Firebase credentials in frontend/.env or continue in Guest Mode.");
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please supply Firebase credentials in frontend/.env or continue in Guest Mode.");
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return cred;
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error("Google login is disabled because Firebase is not configured.");
    }
    return signInWithPopup(auth, googleProvider);
  };

  const loginAsGuest = (guestName = "Guest Researcher") => {
    const guestUser = {
      uid: "guest-" + Date.now(),
      email: "guest@jobguard.local",
      displayName: guestName,
      isAnonymous: true
    };
    localStorage.setItem("jobguard_guest_user", JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth && user && !user.isAnonymous) {
      await signOut(auth);
    }
    localStorage.removeItem("jobguard_guest_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      setAuthError,
      isFirebaseConfigured,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginAsGuest,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
