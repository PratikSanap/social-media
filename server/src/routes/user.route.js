import express from 'express';
import {
  signup,
  login,
  updateuserprofile,
  getProfile,
  uploadProfileImage,
  createPost,
  likePost,
  createComment,
  getPostsByUserId,
  searchUsers,
  getUserById,
  getProfilePicture,
  friendRequest,
  receivedReq,
  acceptFriendRequest,
  getFriends,
  getLike,
  getComment,
  fetchcomment,
  fetchlikes
} from '../controllers/user.controller.js';
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Import the authentication middleware
import dotenv  from 'dotenv';
dotenv.config();
const router = express.Router();

// Apply authenticateToken middleware to protect routes
router.post('/upload-profile-image', authenticateToken, upload.single('profileImage'), uploadProfileImage);
router.get('/profile', getProfile);
router.post('/signup', signup);
router.post('/updateprofile',  upload.single('profilePicture'), updateuserprofile);
router.post('/login', login);
router.post('/posts', authenticateToken, createPost);
router.get('/user/:userId', getPostsByUserId);
router.get('/search', searchUsers);
router.get('/search/:userId',getUserById);
//router.get('/:profilePicture', getProfilePicture);
router.post('/friendRequest/:userId',authenticateToken,friendRequest);
router.get('/received',authenticateToken,receivedReq);
router.post('/friendRequest/:requestId/accept', authenticateToken, acceptFriendRequest);

router.get('/list', authenticateToken, getFriends);
router.post('/posts/:postId/like',authenticateToken,getLike);
router.post('/posts/:postId/comment',authenticateToken,getComment);
router.get('/posts/:postId/comments',fetchcomment);
router.get('/posts/:postId/likes',fetchlikes);
export default router;
