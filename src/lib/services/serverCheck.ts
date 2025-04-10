import axios from '../axiosConfig';
import toast from 'react-hot-toast';

/**
 * Service to check server status and connectivity
 */
const serverCheckService = {
  /**
   * Check if the server is running and accessible
   * @returns Promise<boolean> True if server is accessible
   */
  isServerRunning: async (): Promise<boolean> => {
    try {
      // Make a simple request to check server status
      const response = await axios.get('/api/health', { 
        timeout: 5000 
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  },

  /**
   * Show server status in a user-friendly way
   */
  showServerStatus: async (): Promise<void> => {
    toast.loading('Checking server connection...', { id: 'server-check' });
    
    try {
      const isRunning = await serverCheckService.isServerRunning();
      
      toast.dismiss('server-check');
      
      if (isRunning) {
        toast.success('Server is running correctly');
      } else {
        toast.error('Server connection failed. The API server appears to be unavailable.');
        console.error('Server connection failed. Please check if your backend is running.');
      }
    } catch {
      toast.dismiss('server-check');
      toast.error('Failed to check server status');
    }
  }
};

export default serverCheckService; 