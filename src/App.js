import React, { useState, useEffect, useRef } from 'react';
import './App.css';  // Import the CSS file
import { auth, db, rtdb } from './firebase'; 
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, addDoc, getDocs, deleteDoc } from 'firebase/firestore'; // Added addDoc and getDocs
import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import EmojiPicker from 'emoji-picker-react';  // Importing emoji picker

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false); // Typing indicator state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);  // State to show emoji picker

  // Ref for scroll to bottom
  const messagesEndRef = useRef(null);

  // Handle login
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      handleUserPresence(userCredential.user);
    } catch (error) {
      console.error('Login failed:', error.message);
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  // Handle logout (although we won't use the button anymore, it's here if needed in the future)
  const handleLogout = async () => {
    if (user) {
      const userStatusRef = ref(rtdb, `status/${user.uid}`);
      await set(userStatusRef, {
        online: false,
        lastSeen: serverTimestamp()
      });
      await signOut(auth);
      setUser(null);
    }
  };

  // Handle user presence (online/offline)
  const handleUserPresence = (currentUser) => {
    const userStatusRef = ref(rtdb, `status/${currentUser.uid}`);
    
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
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (message.trim() !== '') {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() !== '') {
      try {
        await addDoc(collection(db, 'chats'), {
          text: message,
          sender: user.email,
          timestamp: new Date()
        });
        setMessage('');
        setTyping(false); // Reset typing indicator after sending message
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Listen for new messages in Firestore
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp'), limit(20));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArr = [];
      querySnapshot.forEach((doc) => {
        messagesArr.push(doc.data());
      });
      setMessages(messagesArr);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Clear chat function
  const handleClearChat = async () => {
    const querySnapshot = await getDocs(collection(db, 'chats'));
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });
    setMessages([]);
  };

  // Handle emoji click and insert emoji into the message input
  const handleEmojiClick = (emojiData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  return (
    <div className="App">
      {!user ? (
        <div className="login-container">
          <h1>Login to Chat</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>Login</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h1>Welcome, {user.email}</h1>
            <button className="clear-chat-button" onClick={handleClearChat}>Clear Chat</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />

          {typing && <div className="typing-indicator">Someone is typing...</div>}

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSendMessage}>Send</button>

            {/* Emoji Picker Button */}
            <button 
              className="emoji-button" 
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              😀
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
