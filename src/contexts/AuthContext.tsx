import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type User = {
  email: string;
  role: 'manager' | 'pantry' | 'delivery';
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (email === 'hospital_manager@xyz.com' && password === 'Password@2025') {
        const userData: User = { email, role: 'manager', name: 'Hospital Manager' };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Welcome back, Hospital Manager!');
        navigate('/manager/dashboard');
      } else if (email === 'hospital_pantry@xyz.com' && password === 'Password@2025') {
        const userData: User = { email, role: 'pantry', name: 'Pantry Staff' };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Welcome back, Pantry Staff!');
        navigate('/pantry/dashboard');
      } else if (email === 'hospital_delivery@xyz.com' && password === 'Password@2025') {
        const userData: User = { email, role: 'delivery', name: 'Delivery Staff' };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Welcome back, Delivery Staff!');
        navigate('/delivery/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}