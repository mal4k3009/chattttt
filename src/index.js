import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeApp } from 'firebase/app'; // Firebase setup
import { firebaseConfig } from './firebase'; // Importing the Firebase config

// Initialize Firebase
initializeApp(firebaseConfig);

// Rendering the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
