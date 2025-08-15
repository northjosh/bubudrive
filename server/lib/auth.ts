import * as jose from 'jose';
import { v4, validate } from 'uuid';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from './errors';
import { getConfig, validateEnv } from '../config/env';

export interface User {
  id: string;
  username: string;
  password: string;
}

validateEnv();

const getJwtSecret = () => new TextEncoder().encode(getConfig().JWT_SECRET);

export const signJwt = async (payload: { id: string }) => {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.id)
    .setExpirationTime('1h')
    .sign(getJwtSecret());
  return token;
};

export const verifyJwt = async (token: string) => {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const signup = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const existing = getUser(username);
  if (existing) {
    return null;
  }

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);

  const newUser: User = {
    id: v4(),
    username: username.toLowerCase(),
    password: hashed,
  };
  db.data.users.push(newUser);
  await db.write();
  return { id: newUser.id, username: newUser.username };
};

export const fetchUserFromToken = async (token: string) => {
  const payload = await verifyJwt(token);
  if (!payload || !payload.sub) {
    return null;
  }
  return db.findUserById(payload.sub as string);
};

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  // Input validation
  if (!username || !password) {
    return null;
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return null;
  }

  if (username.length > 255 || password.length > 255) {
    return null;
  }

  const user = getUser(username);

  if (!user) {
    return null;
  }

  if (await bcrypt.compare(password, user.password)) {
    return signJwt({ id: user.id });
  } else {
    return null; // Don't throw error to prevent user enumeration
  }
};

function getUser(username: string) {
  if (!username || typeof username !== 'string') {
    return undefined;
  }
  return db.data.users.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );
}
export function getUserById(id: string) {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid user ID');
  }

  const user = db.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return { id: user.id, username: user.username }; // Don't return password hash
}

export function getAllUsers() {
  return db.data.users.map(u => ({ id: u.id, username: u.username })); // Don't return password hashes
}

export function searchUsers(query: string) {
  if (!query || typeof query !== 'string' || query.length < 2) {
    return [];
  }

  if (query.length > 50) {
    return [];
  }

  return db.data.users
    .filter(u => u.username.toLowerCase().includes(query.toLowerCase()))
    .map(u => ({ id: u.id, username: u.username })); // Don't return password hashes
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authorization header with Bearer token required',
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Token not provided',
    });
  }

  try {
    const decoded = await verifyJwt(token);
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    const user = await fetchUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      message: 'Token verification failed',
    });
  }
}
