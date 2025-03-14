"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type User,
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
  user: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const beautifyError = (error: any): string => {
    console.log(error);
    return error.code.replace("auth/", "").replaceAll("-", " ");
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      // Force a router refresh to ensure navigation works
      router.refresh();
    } catch (error: any) {
      setError(beautifyError(error));
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setError(null);
      // For Firebase, we'll use the username as email
      // In a real app, you might want to handle this differently
      await signInWithEmailAndPassword(auth, username, password);
      // Force a router refresh to ensure navigation works
      router.refresh();
    } catch (error: any) {
      setError(beautifyError(error));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Force a router refresh to ensure navigation works
      router.refresh();
    } catch (error: any) {
      setError(beautifyError(error));
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Force a router refresh to ensure navigation works
      router.refresh();
    } catch (error: any) {
      setError(beautifyError(error));
    }
  };

  const initializeAuth = async (): Promise<void> => {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error: any) {
      console.error("Error setting persistence:", error);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    setError(null);
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUser(user.email);
        setError(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
