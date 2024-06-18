import React, { useState } from 'react';
import  axios  from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/StylesP/Navbar.css'; // Adjust the path according to your file structure
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faComments } from '@fortawesome/free-solid-svg-icons';
const Navbar = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
  
    const handleSearchChange = async (e) => {
      const query = e.target.value;
      setSearchTerm(query);
  
      if (query.length > 2) {
        try {
          const response = await axios.get(`http://localhost:5500/api/media/search?query=${query}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error searching for users:', error);
        }
      } else {
        setSearchResults([]);
      }
    };
  
    const handleResultClick = (userId) => {
      navigate(`/profile/${userId}`);
    };
  
    return (
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate('/home')}>MyApp</div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search users"
          className="navbar-search"
        />
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((user) => (
              <li key={user.id} onClick={() => handleResultClick(user.id)}>
                <img src={user.profilePicture} alt={`${user.name}'s profile`} className="search-result-image" />
                <span>{user.name} ({user.email})</span>
              </li>
            ))}
          </ul>
        )}
        
        <div className="navbar-buttons">
          <button className='notification-badge' onClick={() => navigate('/notifications')}>
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button onClick={() => navigate('/profile')}>
            <FontAwesomeIcon icon={faUser} />
          </button>
          <button onClick={() => navigate('/chat')}>
            <FontAwesomeIcon icon={faComments} />
          </button>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
