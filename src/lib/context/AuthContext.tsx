import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from '../axiosConfig';
import { requestWithRetry } from '../axiosConfig';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial page load

  // Set up axios default headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount or when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        setInitialLoad(false);
        return;
      }

      try {
        const response = await requestWithRetry({
          method: 'get',
          url: '/api/auth/me'
        });
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        
        // Only show error if not the initial page load
        if (!initialLoad) {
          toast.error('Session expired. Please log in again.');
        }
      }
      
      setIsLoading(false);
      setInitialLoad(false);
    };

    loadUser();
  }, [token, initialLoad]);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      toast.loading('Logging in...', { id: 'login' });
      
      const response = await requestWithRetry({
        method: 'post',
        url: '/api/auth/login',
        data: { email, password }
      });
      
      toast.dismiss('login');
      toast.success('Login successful!');
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      toast.dismiss('login');
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
      throw error;
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      toast.loading('Creating your account...', { id: 'register' });
      
      const response = await requestWithRetry({
        method: 'post',
        url: '/api/auth/register',
        data: { name, email, password },
        timeout: 20000 // Allow longer timeout for registration
      }, 3); // More retries for registration
      
      toast.dismiss('register');
      toast.success('Registration successful!');
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      toast.dismiss('register');
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again later.');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 