import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/StylesP/getprofile.css';
import { FaUserAlt, FaInfoCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import {UserContext} from '../api/UserContext.jsx'
import { refreshAccessToken } from './authService.js';
const Getprofile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [buttonText, setButtonText] = useState('Send Friend Request');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5500/api/media/search/${userId}`);
        setUserData(response.data);
      } catch (err) {
        setError('Error fetching user data.');
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSendFriendRequest = async () => {
    try {
      const token = await refreshAccessToken();
        await axios.post(`http://localhost:5500/api/media/friendRequest/${userId}`, null, {
           
            headers: {
                Authorization: `Bearer ${token}`, // Use token for authentication
            },
        });
        setButtonText('Friend Request Sent');
    } catch (error) {
        console.error('Error sending friend request:', error);
    }
};

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
       <div className='profile-header'>
       
        <img
           // src={`http://localhost:5500/api/admin/${userData.profilePicture}`}
            alt={`${userData.name}'s profile`}
            className="profile-picture"
        />
        </div>
        <h1>{userData.name}</h1>
        <div className="profile-bio">
            <p><FaUserAlt className="icon" />Email: {userData.email}</p>
        </div>
        <div className="profile-bio">
            <p><FaInfoCircle className="icon" />Bio: {userData.bio}</p>
        </div>
        <div className="profile-bio">
            <p><FaInfoCircle className="icon" />Interests: {userData.interests}</p>
        </div>
        <div className="profile-header">
            
            <button onClick={handleSendFriendRequest}>{buttonText}</button>
        </div>
    </div>
);
};
export default Getprofile;
