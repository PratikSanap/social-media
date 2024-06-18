import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
    console.log('ACCESS_TOKEN_SECRET (during verification):', process.env.ACCESS_TOKEN_SECRET);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
   console.log("auth");
   console.log(token);
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    console.log(user);
    if (!user) {
      return res.sendStatus(403); // User not found or token invalid
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.sendStatus(500);
  }
};
