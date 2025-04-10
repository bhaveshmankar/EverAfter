import { createClient } from '@supabase/supabase-js/dist/module';
import toast from 'react-hot-toast';

// TODO: Fix TypeScript typing for Supabase client when upgrading to latest Supabase version
// Currently using 'any' type as a workaround due to type resolution issues

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the URL is pointing to localhost
const isLocalhost = supabaseUrl?.includes('localhost') || supabaseUrl?.includes('127.0.0.1');

// Fallback to cloud Supabase if local server is not available
const FALLBACK_SUPABASE_URL = 'https://rnbviyuclwupdqqvytkg.supabase.co';
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYnZpeXVjbHd1cGRxcXZ5dGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2NTkzMDUsImV4cCI6MjAyODIzNTMwNX0.HNOYXz-sZBYdNnpBb0JqiDVK1mzU8mMDzcRHFr2ewHk';

console.log('Supabase URL:', supabaseUrl ? 'Defined' : 'Missing');
if (isLocalhost) {
  console.warn('Using localhost Supabase URL. Will fallback to cloud instance if local server is unreachable.');
}

// Check if Supabase credentials are available
if (!supabaseUrl) {
  console.warn(
    'Missing VITE_SUPABASE_URL environment variable. Using demo mode with mock data.'
  );
}

if (!supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. Using demo mode with mock data.'
  );
}

// Create Supabase client with error handling
let supabase: any;
let usingLocalServer = false;
let usingFallback = false;

try {
  // Use the provided URL or fallback to a placeholder
  const url = supabaseUrl || FALLBACK_SUPABASE_URL;
  const key = supabaseAnonKey || FALLBACK_SUPABASE_KEY;
  
  usingLocalServer = url.includes('localhost') || url.includes('127.0.0.1');
  
  supabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'wedding-planner-app',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'apikey': key,
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  
  console.log('Supabase client initialized');
  
  // Check connection status (without actually making a request)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Running in demo mode - Supabase operations will be mocked');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  setupMockClient();
}

// If using localhost server, ping it to ensure it's reachable
if (usingLocalServer) {
  console.log('Testing connection to local Supabase server...');
  
  // Test connection with a timeout
  const testConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(supabaseUrl, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Server returned error status');
      
      console.log('Local Supabase server is reachable');
    } catch (err) {
      console.error('Local Supabase server is unreachable:', err);
      console.log('Falling back to cloud Supabase instance');
      
      // Fallback to cloud instance
      try {
        supabase = createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
          global: {
            headers: {
              'X-Client-Info': 'wedding-planner-app',
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'apikey': FALLBACK_SUPABASE_KEY,
            },
          },
        });
        usingFallback = true;
        toast.error('Cannot connect to local server. Using cloud Supabase instead.');
      } catch (fallbackErr) {
        console.error('Failed to initialize fallback Supabase client:', fallbackErr);
        setupMockClient();
      }
    }
  };
  
  testConnection();
}

// Mock client setup function for error cases
function setupMockClient() {
  // Create a mock client that won't actually connect to Supabase
  // This allows the app to run in demo mode
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } })
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'mock-id' }, error: null })
        })
      })
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {}
        })
      })
    })
  };
  console.warn('Using mock Supabase client for demo mode');
  toast.error('Failed to connect to Supabase. Using offline demo mode.');
}

export { supabase };