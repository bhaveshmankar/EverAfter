import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/axiosConfig'; // Import axios config early
import App from './App.tsx';
import './index.css';
import { showServerStatus } from './utils/serverCheck';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id "root" in index.html');
}

const root = createRoot(rootElement);

// Error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Render the app
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// After the app mounts, check the server status
const checkApiConnection = async () => {
  // Wait a moment for the app to fully initialize
  setTimeout(async () => {
    await showServerStatus();
  }, 1000);
};

// Call the check function
checkApiConnection();
