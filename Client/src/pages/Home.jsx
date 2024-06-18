import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { refreshAccessToken } from './authService.js';
import '../styles/StylesP/Home.css';
import Navbar from './Navbar.jsx';

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
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserIdAndPosts = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          const decodedToken = decodeJWT(token);
          if (decodedToken && decodedToken.userId) {
            setUserId(decodedToken.userId);
            await fetchPosts(decodedToken.userId);
          } else {
            console.error('Invalid decoded token');
          }
        } else {
          console.error('Failed to refresh access token');
        }
      } catch (error) {
        console.error('Error fetching user ID and posts:', error);
      }
    };

    fetchUserIdAndPosts();
  }, []);

  const fetchPosts = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5500/api/media/user/${userId}`);
      const postsWithLikes = await Promise.all(response.data.map(async (post) => {
        const commentsResponse = await axios.get(`http://localhost:5500/api/media/posts/${post.id}/comments`);
        const likesResponse = await axios.get(`http://localhost:5500/api/media/posts/${post.id}/likes`);
        return {
          ...post,
          comments: commentsResponse.data,
          likes: likesResponse.data,
        };
      }));
      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await refreshAccessToken();
      if (token) {
        const decodedToken = decodeJWT(token);
        if (decodedToken && decodedToken.userId) {
          const response = await axios.post(
            'http://localhost:5500/api/media/posts',
            {
              userId: decodedToken.userId,
              content: newPost,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setPosts([...posts, response.data]);
          setNewPost('');
        } else {
          console.error('Invalid decoded token');
        }
      } else {
        console.error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = await refreshAccessToken();
      if (token) {
        const response = await axios.post(
          `http://localhost:5500/api/media/posts/${postId}/like`,
          { userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Update local state to reflect the new likes
        setPosts(posts.map((post) => {
          if (post.id === postId) {
            const updatedLikes = post.likes ? [...post.likes, response.data] : [response.data];
            return { ...post, likes: updatedLikes };
          }
          return post;
        }));
      } else {
        console.error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, commentContent) => {
    try {
      const token = await refreshAccessToken();
      if (token) {
        const response = await axios.post(
          `http://localhost:5500/api/media/posts/${postId}/comment`,
          { userId, content: commentContent },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Update local state to reflect the new comment
        setPosts(posts.map((post) => {
          if (post.id === postId) {
            const updatedComments = post.comments ? [...post.comments, response.data] : [response.data];
            return { ...post, comments: updatedComments };
          }
          return post;
        }));
      } else {
        console.error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };
  return (
    <div className="home-container">
      <Navbar />
      <h1>Home</h1>
      <form onSubmit={handlePostSubmit} className="post-form">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          required
          className="post-input"
        />
        <button type="submit" className="post-button">
          Post
        </button>
      </form>
      <div className="posts-container">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-content">
              <p>{post.content}</p>
              <small>
                By {post.userName} on {new Date(post.createdAt).toLocaleString()}
              </small>
            </div>
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)} className="like-button">
                Like ({post.likes ? post.likes.length : 0})
              </button>
              <form onSubmit={(e) => { e.preventDefault(); handleComment(post.id, e.target.elements.comment.value); }} className="comment-form">
                <input type="text" name="comment" placeholder="Add a comment..." className="comment-input" />
                <button type="submit" className="comment-button">Comment</button>
              </form>
            </div>
            {post.comments && post.comments.length > 0 && (
              <div className="comments-container">
                <h3>Comments</h3>
                <div className="comments-list">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <p>{comment.content}</p>
                      {comment.user && (
                        <small>By {comment.user.name} on {new Date(comment.createdAt).toLocaleString()}</small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
