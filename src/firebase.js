// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAyK7IeRcD1oalpptsodaZq2GXse0N78M",
  authDomain: "mychat-38bdc.firebaseapp.com",
  projectId: "mychat-38bdc",
  storageBucket: "mychat-38bdc.firebasestorage.app",
  messagingSenderId: "969159220934",
  appId: "1:969159220934:web:6eeedb15c80f18a56dc1c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Realtime Database
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Function to handle user presence (online/offline)
const handleUserPresence = (user) => {
  if (user) {
    const userStatusRef = ref(rtdb, `status/${user.uid}`);

    // Set the user as online when connected
    set(userStatusRef, {
      online: true,
      lastSeen: serverTimestamp()
    });

    // Set the user as offline when disconnected
    onDisconnect(userStatusRef).set({
      online: false,
      lastSeen: serverTimestamp()
    });
  }
};

// Listen for authentication state changes to manage presence
onAuthStateChanged(auth, (user) => {
  if (user) {
    handleUserPresence(user);
  }
});

// Function to send a message to Firestore
export const sendMessage = async (text, sender) => {
  try {
    await addDoc(collection(db, "chats"), {
      text: text,
      sender: sender,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Function to listen for new messages in real-time
export const listenForMessages = (callback) => {
  const q = query(collection(db, "chats"), orderBy("timestamp"), limit(20));
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data());
    });
    callback(messages);
  });
};

// Export the firebaseConfig, auth, db, and rtdb instances
export { firebaseConfig, auth, db, rtdb };
