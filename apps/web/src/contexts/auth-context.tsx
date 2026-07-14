'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import type { UserResponseDto, LoginDto, RegisterDto, LoginResponseDto } from '@excepio/shared';

interface AuthContextType {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario desde storage al montar
  useEffect(() => {
    const storedUser = authStorage.getUser();
    if (storedUser && authStorage.isAuthenticated()) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginDto) => {
    const response = await apiClient.post<LoginResponseDto>('/auth/login', credentials);
    const { access_token, user: userData } = response.data;
    
    authStorage.setToken(access_token);
    authStorage.setUser(userData);
    setUser(userData);
    
    router.push('/dashboard');
  };

  const register = async (data: RegisterDto) => {
    await apiClient.post('/auth/register', data);
    // Después de registrar, hacer login automático
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user && authStorage.isAuthenticated();

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
