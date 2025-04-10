import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../lib/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  message?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  message = 'Please login to access this page'
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  
  // Only show the toast message after a short delay and if the component is still mounted
  // This prevents showing messages during initial load or quick navigations
  useEffect(() => {
    if (!isLoading && !isAuthenticated && requireAuth) {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 300); // Small delay to avoid showing messages during quick route changes
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, requireAuth]);
  
  // Show toast message if needed
  useEffect(() => {
    if (showMessage) {
      toast.error(message);
    }
  }, [showMessage, message]);
  
  if (isLoading) {
    // You can create a loading spinner component here
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated && requireAuth) {
    // Save the current location for redirecting back after login
    const currentPath = location.pathname + location.search;
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    
    return <Navigate to={redirectUrl} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 