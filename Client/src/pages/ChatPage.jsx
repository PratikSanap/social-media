import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../api/UserContext.jsx';
import io from 'socket.io-client';
import '../styles/StylesP/ChatPage.css';
import { refreshAccessToken } from './authService.js';
import axios from 'axios';

const socket = io('http://localhost:5500');

const decodeJWT = (token) => {
  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

const ChatPage = () => {
  const { setUser } = useContext(UserContext);
  const [userId, setUserId] = useState(null);
  const [friendName, setFriendName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { friendId } = useParams();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          const decodedToken = decodeJWT(token);
          if (decodedToken && decodedToken.userId) {
            return decodedToken.userId;
          } else {
            console.error('Invalid decoded token');
          }
        } else {
          console.error('Failed to refresh access token');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
      return null;
    };

    const fetchFriendName = async (friendId) => {
      try {
        const response = await axios.get(`http://localhost:5500/api/media/search/${friendId}`);
        if (response.data && response.data.name) {
          console.log(response.data.name);
          setFriendName(response.data.name);
        } else {
          console.error('Failed to fetch friend name');
        }
      } catch (error) {
        console.error('Error fetching friend name:', error);
      }
    };

    const initializeSocket = async () => {
      const fetchedUserId = await fetchUserId();
      console.log("Fetched User ID:", fetchedUserId); // Debugging
      console.log("Friend ID from Params:", friendId); // Debugging
      if (fetchedUserId) {
        setUserId(fetchedUserId);
        await fetchFriendName(friendId);

        socket.emit('getMessages', { userId: fetchedUserId, friendId });

        socket.on('messages', (msgs) => {
          setMessages(msgs || []); // Ensure msgs is an array
        });

        socket.on(`receiveMessage_${fetchedUserId}`, (data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
          socket.off('messages');
          socket.off(`receiveMessage_${fetchedUserId}`);
        };
      }
    };
    initializeSocket();
  }, [userId, friendId]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    console.log(message);
    const newMessage = { senderId: userId, receiverId: friendId, content: message };
    console.log(newMessage);
    socket.emit('sendMessage', newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');
  };

  if (!userId) {
    return <div>Loading...</div>; // Or handle not logged in state
  }

  return (
    <div className="chat-container">
      <h2>Chat with {friendName}</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;


