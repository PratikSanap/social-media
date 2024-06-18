// src/components/FriendsList.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../api/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/StylesP/FriendsList.css';
import { refreshAccessToken } from './authService';
const FriendsList = () => {
    const { user } = useContext(UserContext);
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token =await refreshAccessToken();
                const response = await axios.get('http://localhost:5500/api/media/list', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFriends(response.data);
            } catch (error) {
                console.error('Error fetching friends list:', error);
            }
        };

        fetchFriends();
    }, []);

    const handleFriendClick = (friendId) => {
        navigate(`/chat/${friendId}`);
    };

    return (
        <div className="friends-list-container">
          <h2>Friends</h2>
          <ul className="friends-list">
            {friends.map(friend => (
              <li key={friend.id} className="friend-item" onClick={() => handleFriendClick(friend.id)}>
                <span>{friend.name}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    export default FriendsList;
