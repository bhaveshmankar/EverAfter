// Utility script to create a test venue in Supabase
// Run this with: node src/utils/create-test-venue.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rnbviyuclwupdqqvytkg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYnZpeXVjbHd1cGRxcXZ5dGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2NTkzMDUsImV4cCI6MjAyODIzNTMwNX0.HNOYXz-sZBYdNnpBb0JqiDVK1mzU8mMDzcRHFr2ewHk';

console.log('Creating Supabase client with URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Test venue data
const venueData = {
  name: 'Test Venue',
  description: 'A beautiful test venue for development',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  country: 'Test Country',
  zip: '12345',
  capacity: 100,
  price_per_day: 1000,
  amenities: ['Parking', 'WiFi', 'Catering'],
  images: ['https://source.unsplash.com/random/800x600/?wedding'],
  contact_email: 'test@example.com',
  contact_phone: '555-123-4567'
};

// Create a test venue
async function createTestVenue() {
  try {
    console.log('Attempting to create test venue...');
    
    // First sign up or sign in a test user
    const email = 'test@example.com';
    const password = 'testpassword123';
    
    // Try to sign up first
    let { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    // If user exists, sign in instead
    if (authError && authError.message.includes('already exists')) {
      console.log('User already exists, signing in instead');
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      authData = signInResult.data;
      authError = signInResult.error;
    }
    
    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }
    
    console.log('Authenticated successfully');
    
    // Insert venue with authenticated user
    const { data, error } = await supabase
      .from('venues')
      .insert(venueData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating venue:', error);
      return;
    }
    
    console.log('Successfully created test venue with ID:', data.id);
    console.log('Save this ID for your test bookings:', data.id);
    console.log('You can use it for the foreign key reference in bookings');
    
    // Create availability for this venue for the next 30 days
    const availabilityData = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      availabilityData.push({
        venue_id: data.id,
        date: dateString,
        is_available: true
      });
    }
    
    const { error: availabilityError } = await supabase
      .from('venue_availability')
      .insert(availabilityData);
    
    if (availabilityError) {
      console.error('Error creating venue availability:', availabilityError);
    } else {
      console.log('Created availability for the next 30 days');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createTestVenue(); 