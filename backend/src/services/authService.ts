import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { User, UserPayload } from '../types';
import { generateToken } from '../utils/jwt';

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    const error: any = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const result = await query<User>('SELECT * FROM users WHERE email = $1;', [email]);
  const user = result.rows[0];

  if (!user) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getUserById = async (id: number) => {
  const result = await query<User>('SELECT id, name, email, role, created_at FROM users WHERE id = $1;', [id]);
  const user = result.rows[0];

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};
