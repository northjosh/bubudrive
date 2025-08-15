import { useState, useEffect, createContext, useContext } from "react";
import { trpc } from "../trpc";
interface User {
  id: string;
  username: string;
}


export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean
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

  const loginMutation = trpc.login.useMutation();
  const signupMutation = trpc.signup.useMutation();
  const logoutMutation = trpc.logout.useMutation();
  

  const {data, error, isLoading:loading, refetch} = trpc.me.useQuery(undefined, {
    staleTime: 10 * 60 * 60,
    retry: (failureCount, error: any) => {
      if (error?.data?.code === 'UNAUTHORIZED') {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
      setIsLoading(false);
    } else if (error) {
      setUser(null);
      setIsLoading(false);
    } else if (loading) {
      setIsLoading(true);
    }
  }, [data, error, loading]);



  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ username, password });
      const { data } = await refetch();
      setUser(data ?? null);
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
      await signupMutation.mutateAsync({ username, password });
      return await login(username, password);
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      trpc.useUtils().me.invalidate();
    }
  };


  const isAuthenticated  = !!user
 

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
