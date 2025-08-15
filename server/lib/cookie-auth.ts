import { Response } from 'express';
import { getConfig } from '../config/env';

export const COOKIE_NAME = 'auth-token';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export function getCookieOptions(): CookieOptions {
  const config = getConfig();
  const isProduction = config.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevent XSS attacks
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(res: Response): void {
  const config = getConfig();
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

export function getTokenFromCookies(
  cookies: Record<string, string>
): string | null {
  return cookies[COOKIE_NAME] || null;
}
