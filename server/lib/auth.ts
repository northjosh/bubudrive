import * as jose from "jose";
import { User } from "./db";
import { v4 } from "uuid";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../server";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signJwt = async (payload: { id: string }) => {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setExpirationTime("1h")
    .sign(jwtSecret);
  return token;
};

export const verifyJwt = async (token: string) => {
  try {
    const { payload } = await jose.jwtVerify(token, jwtSecret);
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

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const newUser: User = {
    id: v4(),
    username: username,
    password: hashed,
  };
  db.data.users.push(newUser);
  await db.write();
  return newUser;
};

export const fetchUserFromToken = async (token: string) => {
  const payload = await verifyJwt(token);
  if (!payload) {
    return null;
  }
  return db.data.users.find((u) => u.id === payload?.sub);
};

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const user = getUser(username);

  if (!user) {
    return null;
  }

  if (await bcrypt.compare(password, user.password)) {
    return signJwt({ id: user.id });
  } else {
    return "Invalid Username or Password";
  }
};

function getUser(username: string) {
  return db.data.users.find((u) => u.username === username);
}
