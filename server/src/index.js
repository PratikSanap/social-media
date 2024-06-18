import { app } from './app.js';
import userRoutes from './routes/user.route.js';
import cors from 'cors';
import { authenticateToken } from './middleware/authMiddleware.js';
import http from 'http';
import {Server}  from 'socket.io';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const port = process.env.PORT || 5500;
const server =http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content } = data;
    try {
      if (!content) {
          throw new Error('Content is missing');
      }
      const message = await prisma.message.create({
          data: {
              senderId,
              recipientId: parseInt(receiverId),
              content, // Ensure content is provided
          },
      });
      io.emit(`receiveMessage_${receiverId}`, message);
  } catch (error) {
      console.error('Error sending message:', error);
  }
  });

  socket.on('getMessages',async ({ userId, friendId }) => {
    console.log("userId",userId);
    console.log("friendid",friendId);
    try {
      const messages = await prisma.message.findMany({
          where: {
              OR: [
                  { senderId: parseInt(userId), recipientId: parseInt(friendId)},
                  { senderId: parseInt(friendId), recipientId: parseInt(userId) }
              ]
          }
      });
      socket.emit('messages', messages);
  } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('messages', []); // Ensure an array is sent
  }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server started on Port: ${port}`);
});

