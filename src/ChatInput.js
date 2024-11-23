import React, { useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css"; // Import CSS for emoji-mart

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji) => {
    setMessage(message + emoji.native); // Add the emoji to the message input
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message); // Send the message
      setMessage(""); // Clear the input field
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker); // Toggle emoji picker visibility
  };

  return (
    <div className="chat-input-container">
      <button onClick={toggleEmojiPicker} className="emoji-button">
        😀
      </button>

      {showEmojiPicker && (
        <Picker onSelect={handleEmojiSelect} emoji="point_up" />
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />

      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatInput;
