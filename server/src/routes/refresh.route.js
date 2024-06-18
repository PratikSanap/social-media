import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken } from '../middleware/authService.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/token', async (req, res) => {
  console.log("we are inside refresh token route");
  const { token } = req.body;
  console.log(token);

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const user = jwt.verify(token, secret);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    console.log(dbUser);

    if (!dbUser) {
      return res.sendStatus(404); // User not found
    }

    const accessToken = generateAccessToken(user.userId);
    console.log("accesstokengenerated",accessToken);
    res.json({ accessToken });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.sendStatus(403); // Invalid token
    }
    console.error('Error processing refresh token:', err);
    res.sendStatus(500); // Internal server error
  }
});

export default router;
