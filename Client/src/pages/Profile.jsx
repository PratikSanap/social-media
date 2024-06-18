import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/StylesP/Profile.css';
import { UserContext } from '../api/UserContext';

const Profile = () => {
    const [formData, setFormData] = useState({
        email: '',
        profilePicture: null,
        bio: '',
        interests: ''
    });
    const [message, setMessage] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user && user.email) {
            const fetchProfile = async () => {
                try {
                    const response = await axios.get('http://localhost:5500/api/media/profile', {
                        params: { email: user.email }
                    });
                    setFormData({
                        email: response.data.email,
                        profilePicture: response.data.profilePicture,
                        bio: response.data.bio || '',
                        interests: response.data.interests || ''
                    });
                } catch (error) {
                    setMessage('Error fetching profile data');
                }
            };

            fetchProfile();
        }
    }, [user]);

    const handleChange = (e) => {
        if (e.target.name === 'profilePicture') {
            setFormData({
                ...formData,
                profilePicture: e.target.files[0]
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.email);
        formDataToSend.append('bio', formData.bio);
        formDataToSend.append('interests', formData.interests);
        if (formData.profilePicture) {
            formDataToSend.append('profilePicture', formData.profilePicture);
        }

        try {
            const response = await axios.post('http://localhost:5500/api/media/updateProfile', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData({ ...formData, profilePicture: response.data.profilePicture });
            setMessage('Profile updated successfully');
        } catch (error) {
            setMessage('Error updating profile');
        }
    };

    return (
        <div className="profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    readOnly
                />
                <input
                    type="file"
                    name="profilePicture"
                    onChange={handleChange}
                />
                {formData.profilePicture && (
                    <img src={`http://localhost:5500/${formData.profilePicture}`} alt="Profile" />
                )}
                <textarea
                    name="bio"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="interests"
                    placeholder="Interests"
                    value={formData.interests}
                    onChange={handleChange}
                />
                <button type="submit">Save Changes</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Profile;
