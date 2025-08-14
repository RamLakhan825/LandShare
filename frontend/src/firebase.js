import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDd3n9a6Yot1M6s4-ptERRcQch2F-Izcys",
  authDomain: "landshare-a6bcc.firebaseapp.com",
  projectId: "landshare-a6bcc",
  storageBucket: "landshare-a6bcc.firebasestorage.app",
  messagingSenderId: "654549901566",
  appId: "1:654549901566:web:5f038bf20a7beb5a7ac5af",
  measurementId: "G-E7VZWSE91B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
