import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCGIUhr2_yVWYKl9Wk4f2_T_dZTZI97is8',
  authDomain: 'rings-5d74c.firebaseapp.com',
  projectId: 'rings-5d74c',
  storageBucket: 'rings-5d74c.firebasestorage.app',
  messagingSenderId: '842671883498',
  appId: '1:842671883498:web:0b9545bdd012327ab60393',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
