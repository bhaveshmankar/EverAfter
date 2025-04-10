import { supabase } from '../supabase';
import { requestWithRetry } from '../axiosConfig';

export interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: {
    min: number;
    max: number;
  };
  images: string[];
  price_per_hour: number;
  base_price: number;
  amenities: string[];
  tags: string[];
}

// Function to ensure a test venue exists for demonstration purposes
export const ensureTestVenueExists = async (): Promise<string> => {
  try {
    console.log('Checking for existing venues...');
    
    try {
      // Check if we already have some venues (without authentication)
      const { data, error } = await supabase
        .from('venues')
        .select('id')
        .limit(1);
      
      // If we successfully retrieved a venue, use its ID
      if (!error && data && data.length > 0) {
        console.log('Found existing venue, using its ID');
        return data[0].id;
      }
    } catch (checkError) {
      console.error('Error checking for venues:', checkError);
      // Continue to attempt creating a venue
    }
    
    console.log('No venues found, creating test venue...');
    
    try {
      // Try to create a test venue
      const { data, error } = await supabase
        .from('venues')
        .insert({
          name: 'Test Venue',
          description: 'A test venue for demonstration purposes',
          location: 'Demo Location',
          capacity: { min: 10, max: 200 },
          amenities: ['Demo Amenity'],
          images: ['https://via.placeholder.com/300'],
          price_per_hour: 5000,
          base_price: 50000,
          tags: ['Test', 'Demo']
        })
        .select()
        .single();
      
      if (error) {
        // If we get an authentication or permission error, use a mock ID
        if (error.message.includes('violates row-level security policy') || 
            error.code === '42501' || error.code === '401' || 
            error.message.includes('Unauthorized')) {
          console.error('Error creating test venue:', error);
          console.log('Using hardcoded venue ID due to permission issues');
          return '11111111-1111-1111-1111-111111111111';
        }
        
        throw error;
      }
      
      console.log('Created test venue successfully');
      return data.id;
    } catch (insertError) {
      console.error('Failed to create test venue:', insertError);
      
      // Return a hardcoded UUID for demo purposes
      console.log('Using hardcoded venue ID as fallback');
      return '11111111-1111-1111-1111-111111111111';
    }
  } catch (error) {
    console.error('Error in ensureTestVenueExists:', error);
    console.log('Using fallback UUID due to error');
    return '11111111-1111-1111-1111-111111111111';
  }
};

// Fetch all venues
export const getVenues = async () => {
  try {
    // Get user session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    // Create headers for request
    const headers: {[key: string]: string} = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': supabase.supabaseKey,
    };
    
    // Add authorization header if we have a session
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .headers(headers);
    
    if (error) {
      console.error('Error fetching venues from Supabase:', error);
      // Return empty array instead of throwing
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching venues:', error);
    // Return empty array instead of throwing
    return [];
  }
};

// Fetch a venue by ID
export const getVenueById = async (venueId: string, token?: string) => {
  try {
    // Get current session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    // First try to get venue from Supabase
    try {
      // Create headers for request
      const headers: {[key: string]: string} = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': supabase.supabaseKey,
      };
      
      // Add authorization header if we have a session or token
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Ensure proper headers for REST API calls
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .headers(headers)
        .single();
      
      if (data && !error) {
        return data;
      }
      
      // If there's an error, log it but continue to fallback
      if (error) {
        console.log(`Supabase error for venue ${venueId}:`, error);
      }
    } catch (supabaseError) {
      console.log('Supabase fetch failed, trying API:', supabaseError);
    }

    // If Supabase fails or returns no data, try the API
    if (token) {
      const response = await requestWithRetry({
        url: `/api/venues/${venueId}`,
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        }
      }, 2);
      
      return response.data;
    }
    
    // If we get here, create a placeholder response to prevent UI errors
    return {
      id: venueId,
      name: "Venue Information Unavailable",
      description: "Sorry, we couldn't load this venue's details at the moment.",
      location: "Unknown location",
      capacity: { min: 0, max: 0 },
      images: [],
      price_per_hour: 0,
      base_price: 0,
      amenities: [],
      tags: []
    };
  } catch (error) {
    console.error(`Error fetching venue ${venueId}:`, error);
    
    // Return fallback data rather than throwing to prevent UI errors
    return {
      id: venueId,
      name: "Venue Information Unavailable",
      description: "Sorry, we couldn't load this venue's details at the moment.",
      location: "Unknown location",
      capacity: { min: 0, max: 0 },
      images: [],
      price_per_hour: 0,
      base_price: 0,
      amenities: [],
      tags: []
    };
  }
};

// Fetch venue details for multiple bookings
export const getVenuesForBookings = async (venueIds: string[], token?: string) => {
  try {
    if (!venueIds || venueIds.length === 0) {
      return {};
    }
    
    // Get unique venue IDs to avoid duplicate requests
    const uniqueVenueIds = [...new Set(venueIds)];
    
    const venueDetailsMap: Record<string, Venue> = {};
    
    // Track failed requests to avoid multiple retries
    const failedVenueIds = new Set<string>();
    
    for (const venueId of uniqueVenueIds) {
      if (!venueId || failedVenueIds.has(venueId)) continue;
      
      try {
        const venue = await getVenueById(venueId, token);
        if (venue) {
          console.log(`Venue details fetched for ID ${venueId}:`, venue);
          venueDetailsMap[venueId] = venue;
        }
      } catch (venueError) {
        console.error(`Error fetching venue details for ID ${venueId}:`, venueError);
        failedVenueIds.add(venueId);
        
        // Add a placeholder instead of failing completely
        venueDetailsMap[venueId] = {
          id: venueId,
          name: "Venue Information Unavailable",
          description: "Venue details could not be loaded",
          location: "Unknown location",
          capacity: { min: 0, max: 0 },
          images: [],
          price_per_hour: 0,
          base_price: 0,
          amenities: [],
          tags: []
        };
      }
    }
    
    return venueDetailsMap;
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return {};
  }
}; 