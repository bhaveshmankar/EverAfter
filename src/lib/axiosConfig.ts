import axios from 'axios';
import toast from 'react-hot-toast';

// Determine API base URL - try multiple possibilities to handle different environments
const determineAPIUrl = () => {
  // First try the environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running in the same domain (production), use relative URL
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  
  // For local development, handle common configurations
  
  // 1. Try checking for a port in localStorage (if we found a working port previously)
  const savedPort = localStorage.getItem('working_api_port');
  if (savedPort) {
    console.log(`Using previously working API port: ${savedPort}`);
    return `http://localhost:${savedPort}`;
  }
  
  // 2. Check if we're running on port 5001 which seems to be working
  if (localStorage.getItem('server_detected_on_port_5001') === 'true') {
    return 'http://localhost:5001';
  }
  
  // 3. Common development server ports to try - will be tested in order during health checks
  return 'http://localhost:5002'; // Default port - serverCheck will try others
};

// Store the working ports we find
export const saveWorkingPort = (port: number) => {
  localStorage.setItem('working_api_port', port.toString());
  console.log(`Saved working API port: ${port}`); // Just log to console, not visible to user
  
  // Special case for port 5001 which seems likely based on the logs
  if (port === 5001) {
    localStorage.setItem('server_detected_on_port_5001', 'true');
  }
};

// Configure axios with base URL and options
const API_URL = determineAPIUrl();
console.log('🔌 API URL configured as:', API_URL);

// Create additional instances for other possible ports to try
// in case the primary connection fails
const fallbackInstances = [5001, 5000, 3001].map(port => {
  return {
    port,
    instance: axios.create({
      baseURL: `http://localhost:${port}`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
    })
  };
});

const instance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*'
  },
  // Important for handling CORS and credentials properly
  withCredentials: true // Enable cookies/credentials for proper auth
});

// Track if we're during initial page load to avoid showing errors 
let isInitialPageLoad = true;
setTimeout(() => {
  isInitialPageLoad = false;
}, 2000); // Set to false after 2 seconds

// Add request interceptor to automatically add auth token
instance.interceptors.request.use(
  (config) => {
    // Get Supabase session token if available
    const supabaseSession = localStorage.getItem('supabase.auth.token');
    const localToken = localStorage.getItem('token');
    
    // Prefer Supabase token if available
    let token = null;
    if (supabaseSession) {
      try {
        const parsed = JSON.parse(supabaseSession);
        token = parsed?.currentSession?.access_token;
      } catch (e) {
        console.error('Failed to parse Supabase session:', e);
      }
    }
    
    // Fall back to local token
    if (!token && localToken) {
      token = localToken;
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Always ensure Accept header is present
    config.headers['Accept'] = 'application/json, text/plain, */*';
    
    // Log request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 406 Not Acceptable errors specifically
    if (error.response?.status === 406) {
      console.error('🚫 406 Not Acceptable Error:', error);
      console.log('Request headers:', error.config?.headers);
      console.log('Response headers:', error.response?.headers);
      console.log('Endpoint:', error.config?.url);
      
      if (!isInitialPageLoad) {
        toast.error('The server could not process this request. Please try again later.');
      }
      return Promise.reject(error);
    }
    
    // Handle connection refused errors specifically (the main issue we're trying to fix)
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
        (error.message && error.message.includes('Network Error'))) {
      console.error('🔥 CONNECTION REFUSED ERROR:', error);
      
      // Check if there's a specific port in the error URL that's not working
      let failedPort = '';
      if (error.config?.url) {
        const match = error.config.url.match(/localhost:(\d+)/);
        if (match && match[1]) {
          failedPort = match[1];
        }
      }
      
      // Don't show port-specific messages to users, just show a generic message
      // Skip error toast during initial page load
      if (!isInitialPageLoad) {
        toast.error(`Cannot connect to server. Please try again later.`);
      }
      
      // Try to help diagnose the issue in console only
      console.log('🔍 Diagnostics info:');
      console.log('- Check if server is running on correct port');
      console.log('- Check for CORS issues (if API is on different domain)');
      console.log('- Check for network/firewall restrictions');
      
      // Silently attempt to set working port to 5001 based on the logs
      if (failedPort === '5002') {
        saveWorkingPort(5001);
      }
      
      return Promise.reject(error);
    }
    
    // Handle timeouts specifically
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      console.error('⏱️ Request timeout:', error);
      if (!isInitialPageLoad) {
        toast.error('Server request timed out. Please try again.');
      }
      return Promise.reject(error);
    }
    
    // Handle aborted/canceled requests
    if (error.code === 'ERR_CANCELED') {
      console.error('🛑 Request was canceled:', error);
      return Promise.reject(error);
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // If user is not logged in or token is invalid
      console.error('🔒 Authentication error:', error.response?.data?.message || 'Authentication required');
      
      // Check if the request is for a user-initiated action (not just page load)
      const isAuthRequest = error.config?.url?.includes('/api/auth/');
      const isDataRequest = error.config?.url?.includes('/api/bookings') || 
                           error.config?.url?.includes('/api/venues');
      
      // Only show error for auth requests or if not during initial page load
      if ((isAuthRequest || isDataRequest) && !isInitialPageLoad) {
        // Show error message only for user-initiated actions
        toast.error('Please login to continue');
        
        // Get current path for redirect after login
        const currentPath = window.location.pathname + window.location.search;
        
        // Redirect to login page with return URL
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    } else if (error.response && !isInitialPageLoad) {
      // Handle other API errors - but not during initial page load
      console.error('API Error:', error.response.data);
      toast.error(error.response.data.message || 'An error occurred');
    } else if (error.request && !isInitialPageLoad) {
      // Handle network errors - but not during initial page load
      console.error('Network Error:', error.request);
      toast.error(`Server connection failed. Please check if the server is running at ${API_URL}.`);
    } else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Create a custom request function that implements timeout using AbortController
export const requestWithTimeout = async (config: any) => {
  const controller = new AbortController();
  const timeoutDuration = config.timeout || 30000;
  
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutDuration);

  try {
    const response = await instance({
      ...config,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

// Improved retry functionality with fallback ports
export const requestWithRetry = async (config: any, maxRetries = 3) => {
  let retries = 0;
  let lastError = null;
  
  // Ensure content headers are properly set
  if (!config.headers) {
    config.headers = {};
  }
  config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  config.headers['Accept'] = config.headers['Accept'] || 'application/json, text/plain, */*';
  
  // First try with the primary instance
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        console.log(`🔄 Retry attempt ${retries}/${maxRetries} for ${config.url}`);
        // Exponential backoff delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
      }
      
      return await requestWithTimeout(config);
    } catch (error: any) {
      lastError = error;
      
      // Log helpful diagnostic information to console only
      if (error.code === 'ERR_NETWORK') {
        console.log(`🔥 Network error during attempt ${retries + 1}/${maxRetries + 1} - server may be down`);
      }
      
      // Special handling for 406 Not Acceptable errors
      if (error.response?.status === 406) {
        console.error('406 Not Acceptable error - trying alternative Accept header');
        // Try with a different Accept header on retry
        config.headers['Accept'] = '*/*';
      }
      
      // Only retry on network errors, timeouts, or 406 errors
      if (
        retries < maxRetries && 
        (!error.response || 
          error.code === 'ECONNABORTED' || 
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ERR_CANCELED' ||
          error.response?.status === 406)
      ) {
        retries++;
        console.log(`🔄 Request failed, will retry (${retries}/${maxRetries}):`, error.message);
      } else {
        // If we've exhausted retries with the primary instance, try fallback instances silently
        let fallbackSucceeded = false;
        
        // Check if fallbacks were already tried in this session to prevent loops
        if (sessionStorage.getItem('fallback_ports_tried') !== 'true') {
          for (const { port, instance: fallbackInstance } of fallbackInstances) {
            try {
              console.log(`🔄 Trying fallback port ${port} for ${config.url}`);
              const response = await fallbackInstance({
                ...config,
                timeout: 3000 // shorter timeout for fallbacks
              });
              
              // If we succeed with a fallback, save it as the working port - silently
              console.log(`✅ Request successful using port ${port}`);
              saveWorkingPort(port);
              fallbackSucceeded = true;
              
              // Mark that fallbacks were tried so we don't retry in an infinite loop
              sessionStorage.setItem('fallback_ports_tried', 'true');
              
              return response;
            } catch (fallbackError: unknown) {
              // Continue to next fallback
              // Safely extract error message regardless of error type
              const errorMessage = fallbackError instanceof Error 
                ? fallbackError.message 
                : typeof fallbackError === 'object' && fallbackError !== null && 'message' in fallbackError
                  ? String((fallbackError as { message: unknown }).message)
                  : 'Unknown error';
                  
              console.log(`❌ Fallback port ${port} failed:`, errorMessage);
            }
          }
          
          // Mark that we've tried fallbacks this session
          sessionStorage.setItem('fallback_ports_tried', 'true');
        }
        
        // If none of the fallbacks worked, throw the original error
        if (!fallbackSucceeded) {
          throw error;
        }
      }
    }
  }
  
  throw lastError || new Error(`Failed after ${maxRetries} retries`);
};

// Health check function to test server connection
export const checkServerHealth = async () => {
  try {
    console.log('🏥 Checking server health...');
    const response = await requestWithTimeout({
      url: '/health',
      method: 'GET',
      timeout: 5000
    });
    
    console.log('✅ Server health check successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    
    // Try alternative health endpoints
    try {
      console.log('Trying alternative health endpoint: /api/health');
      const altResponse = await requestWithTimeout({
        url: '/api/health',
        method: 'GET',
        timeout: 5000
      });
      
      console.log('✅ Alternative health check successful:', altResponse.data);
      return true;
    } catch (altError) {
      console.error('❌ Alternative health check failed:', altError);
      return false;
    }
  }
};

export default instance; 