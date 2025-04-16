import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHPaui6Ut_5_Z8ou9-zcN1_EANKnfihA8",
  authDomain: "wedding-planner-4468a.firebaseapp.com",
  projectId: "wedding-planner-4468a",
  storageBucket: "wedding-planner-4468a.appspot.com",
  messagingSenderId: "304238890733",
  appId: "1:304238890733:web:4cb13d71a93f078cec86e4",
  measurementId: "G-E31WTD7XKX",
  databaseURL: "https://wedding-planner-4468a-default-rtdb.firebaseio.com"
};

let app;
let db: Firestore;
let realtimeDb: Database;
let analytics: Analytics;
let auth: Auth;
let storage: FirebaseStorage;

try {
  // Initialize Firebase
  console.log("Initializing Firebase with config:", {
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL
  });
  
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Realtime Database for real-time booking updates
  realtimeDb = getDatabase(app, firebaseConfig.databaseURL);
  
  // Initialize Analytics
  analytics = getAnalytics(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create mock implementations so the app doesn't crash
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async () => ({}),
        update: async () => ({})
      }),
      add: async () => ({}),
      where: () => ({ get: async () => ({ docs: [] }) })
    })
  } as unknown as Firestore;
  
  realtimeDb = {
    ref: () => ({
      on: () => {},
      off: () => {},
      set: async () => ({})
    })
  } as unknown as Database;
  
  // Mock implementations for other services
  analytics = {} as Analytics;
  auth = {} as Auth;
  storage = {} as FirebaseStorage;
}

export { db, realtimeDb, analytics, auth, storage };
export default app; 
