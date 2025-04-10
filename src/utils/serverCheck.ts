import axios from 'axios';
import { checkServerHealth, saveWorkingPort } from '../lib/axiosConfig';
import toast from 'react-hot-toast';

// Common ports used for development servers
const COMMON_PORTS = [5001, 5000, 3001, 3000, 8080, 8000, 4000];

/**
 * A utility function to check if the API server is running and accessible
 * This can be used to test the connection before making important API calls
 */
export const checkIfServerRunning = async (): Promise<boolean> => {
  try {
    // Check if we've already found a working port in this session
    const checkedThisSession = sessionStorage.getItem('server_check_done');
    if (checkedThisSession === 'true') {
      console.log('Already checked server connection this session. Skipping check.');
      return true;
    }
    
    console.log('Testing connection to API server...');
    
    // First try the health endpoint using the configured API URL
    const result = await checkServerHealth();
    if (result) {
      console.log('Server health check passed ✅');
      sessionStorage.setItem('server_check_done', 'true');
      return true;
    }
    
    console.log('Server health check failed, actively scanning ports...');
    
    // The default port didn't work, so let's try other common ports
    for (const port of COMMON_PORTS) {
      try {
        console.log(`Trying port ${port}...`);
        const testUrl = `http://localhost:${port}/health`;
        
        const response = await axios.get(testUrl, { 
          timeout: 2000,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.status === 200) {
          console.log(`✅ Found working server on port ${port}!`);
          // Save this port for future use (silently)
          saveWorkingPort(port);
          // Don't show a toast about the port
          sessionStorage.setItem('server_check_done', 'true');
          return true;
        }
      } catch (error) {
        // Continue to next port
        console.log(`Port ${port} not responding`);
      }
    }
    
    // If all port checks failed, try alternative endpoints on the default URL
    console.log('All port checks failed, trying alternative endpoints on default URL...');
    
    // Try the root endpoint
    try {
      const response = await axios.get('http://localhost:5001/', { timeout: 2000 });
      console.log('Root endpoint responded:', response.data);
      sessionStorage.setItem('server_check_done', 'true');
      return true;
    } catch {
      console.log('Root endpoint not responding');
    }
    
    // Try the test endpoint
    try {
      const response = await axios.get('http://localhost:5001/api/test', { timeout: 2000 });
      console.log('Test endpoint responded:', response.data);
      sessionStorage.setItem('server_check_done', 'true');
      return true;
    } catch {
      console.log('Test endpoint not responding');
    }
    
    // All attempts failed
    console.error('⚠️ All connection attempts to server failed');
    // Generic error message without port details
    toast.error('Cannot connect to server. Please try again later.');
    return false;
  } catch {
    console.error('Error checking server connection');
    toast.error('Failed to connect to server');
    return false;
  }
};

/**
 * Diagnose common connection issues and provide suggestions
 */
export const diagnoseConnectionIssues = async (): Promise<string[]> => {
  const issues: string[] = [];
  
  // Check if the server is running at all
  let serverRunningAnywhere = false;
  
  // Check each common port to see if server is running on any of them
  for (const port of COMMON_PORTS) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, { 
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        mode: 'no-cors', // Try with no-cors to detect if server exists but CORS is the issue
      });
      
      if (response) {
        serverRunningAnywhere = true;
        // Save the working port silently
        saveWorkingPort(port);
        issues.push(`Server detected on alternative port`);
        break;
      }
    } catch {
      // Continue checking
    }
  }
  
  if (!serverRunningAnywhere) {
    issues.push('Server does not appear to be running');
  }
  
  // Add suggestions for console/logs only
  issues.push('Check server configuration');
  
  return issues;
};

/**
 * Utility to show server status with diagnostic information
 */
export const showServerStatus = async () => {
  const isRunning = await checkIfServerRunning();
  
  if (!isRunning) {
    console.error('Server connection failed. Please check if your backend is running.');
    // Generic message without port details
    toast.error('Server connection issue. Please try again later.');
    
    // Get diagnostic information but don't show to user
    const issues = await diagnoseConnectionIssues();
    console.log('Diagnostic information:', issues);
    
    return false;
  }
  
  console.log('Server connection successful!');
  // No toast confirmation needed for successful connections
  return true;
};

export default { checkIfServerRunning, diagnoseConnectionIssues, showServerStatus }; 