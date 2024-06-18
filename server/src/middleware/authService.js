import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    console.log('ACCESS_TOKEN_SECRET (during signing):', process.env.ACCESS_TOKEN_SECRET);
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET,{expiresIn:'60d'});
};
