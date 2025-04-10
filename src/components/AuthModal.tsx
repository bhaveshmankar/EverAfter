import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Add timeout to detect network connectivity issues
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Server is unreachable. Please check your internet connection.')), 10000)
      );

      if (isLogin) {
        const authPromise = supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        const { error } = await Promise.race([authPromise, timeoutPromise]);
        if (error) throw error;
        toast.success('Successfully logged in!');
      } else {
        const authPromise = supabase.auth.signUp({
          email,
          password,
        });
        
        const { error } = await Promise.race([authPromise, timeoutPromise]);
        if (error) throw error;
        toast.success('Registration successful! You can now log in.');
      }
      onClose();
    } catch (error) {
      // Handle specific network errors
      if (error instanceof Error) {
        let message = error.message;
        
        // Check for different types of connection errors
        if (error.message.includes('unreachable') || 
            error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('network') ||
            !navigator.onLine) {
          message = 'Server is unreachable. Please check your internet connection and try again.';
        }
        
        // Check specifically for localhost connection errors
        if (error.message.includes('localhost:5002') || 
            error.message.includes('127.0.0.1:5002')) {
          message = 'Cannot connect to server at http://localhost:5002. Please ensure server is running or use cloud version.';
          
          // Suggest potential solutions
          setTimeout(() => {
            toast.error('To fix this issue: 1) Start the local server or 2) Reset the app to use cloud version');
          }, 1000);
        }
        
        setErrorMessage(message);
        toast.error(message);
      } else {
        setErrorMessage('An error occurred during authentication');
        toast.error('An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              required
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {errorMessage}
              {errorMessage.includes('localhost:5002') && (
                <div className="mt-2 text-xs">
                  <p>Possible fixes:</p>
                  <ul className="list-disc pl-4">
                    <li>Start the local server</li>
                    <li>Reload the app to use cloud fallback</li>
                    <li>Contact your administrator</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white py-2 px-4 rounded-md hover:bg-rose-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-rose-500 hover:text-rose-600"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;