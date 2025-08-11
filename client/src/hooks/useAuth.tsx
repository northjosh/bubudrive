import { useState, useEffect, createContext, useContext } from "react";
import { trpc } from "../trpc";
import { useNavigate } from "@tanstack/react-router";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const  navigate = useNavigate()

  const loginMutation = trpc.login.useMutation();
  const signupMutation = trpc.signup.useMutation();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      localStorage.setItem("authToken", result.token);
      const userInfo = { id: "temp", username };
      localStorage.setItem("userData", JSON.stringify(userInfo));
      setUser(userInfo);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const signup = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await signupMutation.mutateAsync({ username, password });
      return await login(username, password);
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate({to: "/login"})
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
