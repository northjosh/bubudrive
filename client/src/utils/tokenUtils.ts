import { jwtDecode } from "jwt-decode";
import { tr } from "zod/v4/locales";

interface Claims {
  sub: string;
  exp: number;
  id: string;
}

export function isTokenExpired(token: string) {
  try {
    const access = jwtDecode<Claims>(token);
    return access.exp !== null && access.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}
