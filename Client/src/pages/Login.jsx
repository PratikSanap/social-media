import React, { useContext, useState } from 'react';
import axios from 'axios';
import '../styles/StylesP/Login.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../api/UserContext';

const Login = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5500/api/media/login', formData);
            const { accessToken, refreshToken } = response.data;
            console.log('refreshtoken:',refreshToken);
            // Store tokens in local storage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            console.log('i am here');
            setUser({ name: formData.name, email: formData.email });
            setMessage('Login successful');
            console.log(response);
            navigate('/home');
        } catch (error) {
            setMessage('Error occurred');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
