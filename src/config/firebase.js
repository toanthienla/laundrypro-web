import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDE_MFaM6oJS_fFfdQAsgjR2FIEoQwrJOg",
  authDomain: "laundrypro-1c96e.firebaseapp.com",
  projectId: "laundrypro-1c96e",
  storageBucket: "laundrypro-1c96e.firebasestorage.app",
  messagingSenderId: "352973411655",
  appId: "1:352973411655:web:9df8eda7c26fdd64dd2862"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
