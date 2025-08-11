import { User } from "../lib/db";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
