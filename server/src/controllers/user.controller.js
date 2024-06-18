import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { generateAccessToken, generateRefreshToken } from '../middleware/authService.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const prisma = new PrismaClient();
export const signup = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).send("All fields are required");
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
     
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          refreshToken:"null",
        },
      });
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error signing up user' });
    }
  };
  
  export const login = async (req, res) => {
    console.log("we are inside log in route");
    const { name, email, password } = req.body;
    
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: name },
            { email: email },
          ],
        },
      });
      console.log(user);
      if (!user) {
        return res.status(404).send("User not found");
      }
     const accessToken=generateAccessToken(user.id);
     const refreshToken=generateRefreshToken(user.id);

     
     console.log(accessToken);
     console.log("refreshtoken:",refreshToken);
     const updateduser=await prisma.user.update({
        where:{
            id:user.id,
        },
        data:{
            refreshToken,
        }
     })
    console.log('updateduser:',updateduser);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging in user' });
    }
  };

export const updateuserprofile = async (req, res) => {
    console.log("Updating user profile");
    const { email, bio, interests } = req.body;
    let profilePicture = req.file ? req.file.path : undefined;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if updated
        if (req.file && user.profilePicture) {
            const filePath = path.join(process.cwd(), user.profilePicture);
            fs.unlinkSync(filePath);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                profilePicture,
                bio,
                interests
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

export const getProfile = async (req, res) => {
    console.log("we are inside getprofile route");
    const { email } = req.query;
    console.log(email);
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
            select:{
                bio:true,
                interests:true,
                email:true,
                profilePicture:true,
            }
        });
        console.log(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
      console.log(user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile data' });
    }
};

export const getProfilePicture = (req, res) => {
  const { profilePicture } = req.params;
  
  const filePath = path.join(__dirname, '../', 'uploads', profilePicture);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
          console.error('File does not exist:', filePath);
          return res.status(404).send('File not found');
      }
      
      res.sendFile(filePath);
  });
};
export const uploadProfileImage = async (req, res) => {
    const { email, bio, interests } = req.body; // Assuming email, bio, and interests are sent along with the image
    const profilePicture = req.file ? req.file.path : null;
  
    try {
      const user = await prisma.user.update({
        where: { email },
        data: {
          profilePicture,
          bio,
          interests,
        },
      });
      res.json({ message: 'Profile image updated successfully', user });
    } catch (error) {
      res.status(500).send('Error uploading profile image');
    }
  };


  export const createPost = async (req, res) => {
    console.log("we are inside create post route");
    const { content } = req.body;
    
    const userId=req.user.id;
    console.log(userId);
    try {
      const post = await prisma.post.create({
        data: {
          content,
          userId,
        },
      });
       console.log(post);
      res.status(201).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating post' });
    }
  };

  
  export const likePost = async (req, res) => {
    const { postId } = req.params;
  
    try {
      const updatedPost = await prisma.post.update({
        where: { id: parseInt(postId) },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
  
      res.json(updatedPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error liking post' });
    }
  };
  
  // Comment on a post
  export const createComment = async (req, res) => {
    const { userId, postId, content } = req.body;
  
    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          userId,
          postId,
        },
      });
  
      res.status(201).json(comment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating comment' });
    }
  };
  export const getPostsByUserId = async (req, res) => {
    console.log("we are inside getpost");
    const { userId } = req.params;
    console.log(userId);
  
    try {
      // Fetch posts for the logged-in user
      const posts = await prisma.post.findMany({
        where: {
          userId: Number(userId),
        },
        include: {
          user: true,
        }
      });
  
      // Find all friends of the user
      const friends = await prisma.friend.findMany({
        where: {
          OR: [
            { user1: parseInt(userId) },
            { user2: parseInt(userId) }
          ]
        },
        select: {
          user1: true,
          user2: true,
        }
      });
  
      // Extract friend userIds
      const friendUserIds = friends.flatMap(friend => 
        (friend.user1 === parseInt(userId)) ? friend.user2 : friend.user1
      );
  
      let friendPosts = [];
  
      if (friendUserIds.length > 0) {
        friendPosts = await prisma.post.findMany({
          where: {
            userId: {
              in: friendUserIds,
            }
          },
          include: {
            user: true,
          }
        });
      }
  
      if (posts.length === 0 && friendPosts.length === 0) {
        return res.status(404).json({ message: 'No posts found for this user.' });
      }
  
      const formattedPosts = posts.map(post => ({
        id: post.id,
        content: post.content,
        userName: post.user.name,
        createdAt: post.createdAt,
        fromLoggedInUser: true,
      }));
  
      const formattedFriendPosts = friendPosts.map(post => ({
        id: post.id,
        content: post.content,
        userName: post.user.name,
        createdAt: post.createdAt,
        fromLoggedInUser: false,
      }));
  
      const allPosts = [...formattedPosts, ...formattedFriendPosts];
  
      return res.status(200).json(allPosts);
    } catch (error) {
      console.error('Error fetching posts by user ID:', error);
      res.status(500).json({ message: 'Error fetching posts.' });
    }
  };
  
  export const searchUsers = async (req, res) => {
    const { query } = req.query;
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error searching for users:', error);
      res.status(500).json({ message: 'Error searching for users.' });
    }
  };

  export const getUserById = async (req, res) => {
    console.log("we are inside get userbyid route")
    const { userId } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          bio: true,
          interests: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      console.log(user);
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Error fetching user data.' });
    }
  };

  export const friendRequest =async(req,res)=>{
    console.log("we are inside friend request");
    const { userId } = req.params;
    
    const { loggedInUserId } = req.user.id; // Assuming you have userId stored in req.user
   console.log(userId);
  
    try {
      const requ=await prisma.FriendRequest.findFirst({
        where:{
          fromUserId:req.user.id,
          toUserId:parseInt(userId),
        }
      })
      const requs=await prisma.FriendRequest.findFirst({
        where:{
          fromUserId:parseInt(userId),
          toUserId:req.user.id,
        }
      })
      if(requ ||requs){
       return  res.status(401).json({message:"req already sent"});
      }
        // Save the friend request in your database
        await prisma.FriendRequest.create({
          data:{
            fromUserId: req.user.id,
            toUserId: parseInt(userId),
          }
        });

        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Failed to send friend request' });
    }
  }

  export const receivedReq = async(req,res)=>{
    console.log("we are inside recivingreq");
    console.log(req.user.id);
    try {
      const receivedRequests = await prisma.friendRequest.findMany({
          where: { toUserId: req.user.id },
          include: { fromUser: { select: { id: true, name: true } } } // Select only the user ID and name
      });
      console.log(receivedRequests);
      res.json(receivedRequests);
  } catch (error) {
      console.error('Error fetching received friend requests:', error);
      res.status(500).json({ message: 'Failed to fetch friend requests' });
  }
  }

  export const acceptFriendRequest = async (req, res) => {
    console.log("we are inside acceptreq");
    const { requestId } = req.params;
    const { userId } = req.user.id; // Assuming userId is available in req.user
    console.log(req.user.id);
    try {
        // Fetch the friend request
        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) },
        });

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // Check if the logged-in user is the receiver of the request
        if (friendRequest.toUserId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to accept this request' });
        }
       const kuch= await prisma.friend.findFirst({
          where: {
              user1: friendRequest.fromUserId,
              user2: friendRequest.toUserId,
          },
      });
      if(!kuch){
        // Create a new friend entry
        await prisma.friend.create({
            data: {
                user1: friendRequest.fromUserId,
                user2: friendRequest.toUserId,
            },
        });}
        else{
          await prisma.friendRequest.delete({
            where: { id: parseInt(requestId) },
        });
          return  res.status(200).json({ message: 'They are friends' });
        }

        // Delete the friend request
        await prisma.friendRequest.delete({
            where: { id: parseInt(requestId) },
        });

        res.status(200).json({ message: 'Friend request accepted successfully' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Failed to accept friend request' });
    }
};


const getUserDetailsByIds = async (userIds) => {
  return await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      name: true,
      profilePicture: true
    }
  });
};

export const getFriends = async (req, res) => {
  console.log("friendlist");
  const userId = parseInt(req.user.id);
  console.log(req.user.id);

  try {
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { user1: userId },
          { user2: userId },
        ],
      },
      select: {
        user1: true,
        user2: true
      }
    });

    const friendIds = friends.map(friend => {
      return friend.user1 === userId ? friend.user2 : friend.user1;
    });

    const friendsDetails = await getUserDetailsByIds(friendIds);
    console.log(friendsDetails);

    res.status(200).json(friendsDetails);
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ message: 'Error fetching friends list' });
  }
};

export const getLike = async(req,res)=>{
  console.log("getLike");
  const { postId } = req.params;
  const { userId } = req.body;
    console.log(postId);
    console.log(userId);
  try {
    const like = await prisma.like.create({
      data: {
        postId: parseInt(postId, 10),
        userId: parseInt(userId, 10),
      },
    });

    res.json(like);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const getComment=async(req,res)=>{
  console.log("getComment");
  const { postId } = req.params;
  const { userId, content } = req.body;
  console.log(postId);
  console.log(userId);
  console.log(content);
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: parseInt(postId, 10),
        userId: parseInt(userId, 10),
        content,
      },
      include:{
        user:true,
      }
    });

    res.json(comment);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const fetchcomment = async(req,res)=>{
  const { postId } = req.params;
 console.log(postId);
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId, 10) },
      include: { user: true }, // Include user information
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const fetchlikes = async(req,res)=>{
  const { postId } = req.params;
  console.log(postId);
  try {
    const likes = await prisma.like.findMany({
      where: { postId: parseInt(postId, 10) },
      include: { user: true }, // Include user information
    });
    res.json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
