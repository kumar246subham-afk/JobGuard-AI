import { db, isFirebaseConfigured } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'jobguard_analysis_history';

export const historyService = {
  async saveScan(scanData, user) {
    const record = {
      ...scanData,
      id: "scan-" + Date.now(),
      createdAt: new Date().toISOString(),
      userEmail: user?.email || "guest@jobguard.local",
      userId: user?.uid || "guest"
    };

    // 1. Always update local storage
    try {
      const existing = this.getLocalScans(record.userId);
      const updated = [record, ...existing].slice(0, 50); // keep up to 50 items
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${record.userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed saving scan to localStorage:", e);
    }

    // 2. If Firebase Firestore is active and user is authenticated
    if (isFirebaseConfigured && db && user && !user.isAnonymous) {
      try {
        const docRef = await addDoc(collection(db, "users", user.uid, "scans"), {
          ...scanData,
          timestamp: serverTimestamp()
        });
        record.firestoreId = docRef.id;
      } catch (e) {
        console.warn("Firestore save failed, fell back to local storage:", e);
      }
    }

    return record;
  },

  getLocalScans(userId = "guest") {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async getScans(user) {
    const userId = user?.uid || "guest";
    const localRecords = this.getLocalScans(userId);

    if (!isFirebaseConfigured || !db || !user || user.isAnonymous) {
      return localRecords;
    }

    try {
      const q = query(
        collection(db, "users", user.uid, "scans"),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      const firestoreRecords = snap.docs.map(d => ({
        id: d.id,
        firestoreId: d.id,
        ...d.data(),
        createdAt: d.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      }));

      return firestoreRecords.length > 0 ? firestoreRecords : localRecords;
    } catch (e) {
      console.warn("Firestore fetch failed, returning local records:", e);
      return localRecords;
    }
  },

  async deleteScan(scanId, user) {
    const userId = user?.uid || "guest";
    // Delete from localStorage
    try {
      const existing = this.getLocalScans(userId);
      const updated = existing.filter(s => s.id !== scanId && s.firestoreId !== scanId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error deleting from local storage:", e);
    }

    // Delete from Firestore if exists
    if (isFirebaseConfigured && db && user && !user.isAnonymous) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "scans", scanId));
      } catch (e) {
        console.warn("Firestore delete failed:", e);
      }
    }
  },

  clearScans(userId = "guest") {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${userId}`);
  }
};
