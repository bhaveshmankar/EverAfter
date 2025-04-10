import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface ServerErrorBannerProps {
  supabaseUrl?: string;
  apiUrl?: string;
}

const ServerErrorBanner: React.FC<ServerErrorBannerProps> = ({ 
  supabaseUrl = 'http://localhost:5002',
  apiUrl = 'http://localhost:5002'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCheckedServers, setHasCheckedServers] = useState(false);
  const [working, setWorking] = useState<boolean>(false);
  const [showDelayed, setShowDelayed] = useState(false);

  // Server ports to check
  const commonPorts = [5001, 5000, 3001, 3000, 8080, 8000, 4000];

  // Only show banner after a delay
  useEffect(() => {
    if (isVisible && hasCheckedServers) {
      const timer = setTimeout(() => {
        setShowDelayed(true);
      }, 5000); // 5 second delay to avoid showing during initial page load
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasCheckedServers]);

  useEffect(() => {
    // Don't run the check if it has already been done in this session
    if (sessionStorage.getItem('port_check_completed') === 'true') {
      setHasCheckedServers(true);
      return;
    }

    // Silently check servers
    const checkServers = async () => {
      let serverWorking = false;
      
      // Check API server and scan for working alternatives
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await fetch(apiUrl, { 
          signal: controller.signal,
          mode: 'no-cors'
        });
        
        clearTimeout(timeoutId);
        serverWorking = true;
      } catch (err) {
        console.log('API server not reachable at the configured URL');
        
        // Silently check common alternative ports
        for (const port of commonPorts) {
          try {
            await axios.get(`http://localhost:${port}/health`, { timeout: 2000 });
            // If we get here, we found a working port
            localStorage.setItem('working_api_port', port.toString());
            console.log(`Found working API server on port ${port}`);
            serverWorking = true;
            // Do NOT reload the page here - this causes infinite reloads
            break;
          } catch (portErr) {
            // Try alternative endpoints
            try {
              await axios.get(`http://localhost:${port}/api/test`, { timeout: 2000 });
              localStorage.setItem('working_api_port', port.toString());
              console.log(`Found API server on port ${port} with /api/test endpoint`);
              serverWorking = true;
              // Do NOT reload the page here - this causes infinite reloads
              break;
            } catch {
              // Continue trying other ports
            }
          }
        }
      }
      
      // Check Supabase server
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await fetch(supabaseUrl, { 
          signal: controller.signal,
          mode: 'no-cors'
        });
        
        clearTimeout(timeoutId);
        // Both API and Supabase are working if we get here
        if (serverWorking) {
          setIsVisible(false);
          setWorking(true);
        }
      } catch (err) {
        // Supabase server not reachable, do this silently
        console.log('Supabase server not reachable');
        localStorage.removeItem('supabase_url');
        localStorage.removeItem('supabase_key');
        
        // Only show error banner if both services are down AND we're not in development mode
        // In development, don't show the banner unless user is trying to do something that needs the server
        if (!serverWorking && (process.env.NODE_ENV === 'production' || localStorage.getItem('user_action_pending'))) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } finally {
        setHasCheckedServers(true);
        // Mark check as completed to prevent rechecking
        sessionStorage.setItem('port_check_completed', 'true');
      }
    };

    // Check servers on mount
    checkServers();
  }, [supabaseUrl, apiUrl]);

  const handleDismiss = () => {
    setIsVisible(false);
    setShowDelayed(false);
    // Don't show again for this session
    sessionStorage.setItem('error_banner_dismissed', 'true');
  };

  // Don't show if:
  // 1. Banner isn't visible or checks haven't completed
  // 2. User has dismissed it before
  // 3. Services are working
  // 4. We haven't passed the delay timer yet
  if (!isVisible || !hasCheckedServers || !showDelayed || sessionStorage.getItem('error_banner_dismissed') === 'true' || working) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-50 p-3 shadow-md z-50 border-b border-amber-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="text-amber-500" size={18} />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Connection issue:</span> Cannot connect to server. Some features may be limited.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDismiss} 
            className="text-amber-800 hover:text-amber-950"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorBanner; 