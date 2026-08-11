import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserPayload } from '../types';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, config.jwtSecret) as UserPayload;
};
