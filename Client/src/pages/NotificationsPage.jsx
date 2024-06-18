import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/StylesP/NotificationsPage.css';
import { refreshAccessToken } from './authService.js'; // Adjust the path according to your file structure
const NotificationsPage = () => {
    const [friendRequests, setFriendRequests] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const token=await refreshAccessToken();
                console.log(token);
                const response = await axios.get('http://localhost:5500/api/media/received', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFriendRequests(response.data);
            } catch (error) {
                setError('Error fetching friend requests.');
                console.error('Error fetching friend requests:', error);
            }
        };

        fetchFriendRequests();
    }, []);

  
    const handleShowProfile = (userId) => {
        navigate(`/profile/${userId}`);
      };
    
      const handleAcceptFriendRequest = async (requestId) => {
        try {
            const token = await refreshAccessToken();
            await axios.post(`http://localhost:5500/api/media/friendRequest/${requestId}/accept`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Update the UI to reflect the change
            setFriendRequests((prevRequests) => prevRequests.filter(req => req.id !== requestId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };
    
      if (friendRequests.length === 0) {
        return <div>No friend requests</div>;
      }
    
      return (
        <div className="notification-container">
          <h2>Friend Requests</h2>
          <ul className="friend-request-list">
            {friendRequests.map((request) => (
              <li key={request.id} className="friend-request-item">
                <span>{request.fromUser.name}</span>
                <div className="friend-request-buttons">
                  <button onClick={() => handleShowProfile(request.fromUserId)}>Show Profile</button>
                  <button onClick={() => handleAcceptFriendRequest(request.id)}>Accept Friend Request</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    export default NotificationsPage;
