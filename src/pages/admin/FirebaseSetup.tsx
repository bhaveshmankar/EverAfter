import { useState } from 'react';
import { setupFirebase, testConnection } from '../../lib/services/bookingService';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const DatabaseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const venueId = await setupFirebase();
      if (venueId) {
        setResult(`Database setup complete! Sample venue created with ID: ${venueId}`);
      } else {
        setError('Failed to set up database collections');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      await testConnection();
      // Result will be shown via toast notification
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct test for Supabase Database
  const checkSupabaseDatabase = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Test if Supabase tables exist
      const { error } = await (supabase as any).from('venues').select('count');
      
      if (error) {
        throw error;
      }
      
      setResult(`Supabase database is working! Tables are accessible.`);
      toast.success('Supabase database is connected and working!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Supabase Database Error: ${errorMessage}`);
      
      if (errorMessage.includes('permission')) {
        toast.error('Permission denied. Check Supabase RLS policies.');
      } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        toast.error('Tables not found. You need to create the required tables in Supabase.');
      } else {
        toast.error(`Database Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Setup</h1>
      
      <div className="mb-8 p-6 border rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Test Database Connection</h2>
        <p className="mb-4 text-gray-600">
          First, check if your application can connect to Supabase.
        </p>
        <button
          onClick={handleTestConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={checkSupabaseDatabase}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Check Database Tables'}
        </button>
      </div>
      
      <div className="mb-8 p-6 border rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Initialize Database Tables</h2>
        <p className="mb-4 text-gray-600">
          This will create sample data in your Supabase tables for venues, availability, and other required data.
        </p>
        <button
          onClick={handleSetupDatabase}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Setting up...' : 'Initialize Collections'}
        </button>
      </div>
      
      {result && (
        <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
          {result}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Common Issues:</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            <strong>Connection Timeout:</strong> Make sure your Supabase project is properly set up and has the correct configuration.
          </li>
          <li>
            <strong>Tables Not Found:</strong> You need to create the required tables in Supabase.
            You can run the SQL creation script in the Supabase SQL editor.
          </li>
          <li>
            <strong>Permission Denied:</strong> Your Row Level Security (RLS) policies may be too restrictive.
            In Supabase Dashboard, go to Authentication → Policies and set appropriate RLS policies:
            <pre className="bg-gray-800 text-white p-2 mt-1 text-xs overflow-x-auto rounded">
              {`-- Example RLS policy for public read access
CREATE POLICY "Public can read venues" 
ON venues FOR SELECT USING (true);`}
            </pre>
          </li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Required SQL Tables:</h3>
        <pre className="bg-gray-800 text-white p-2 mt-1 text-xs overflow-x-auto rounded">
          {`-- Create venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity JSONB NOT NULL DEFAULT '{"min": 0, "max": 0}',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  price_per_hour INTEGER NOT NULL,
  base_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Create venue_availability table
CREATE TABLE venue_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(venue_id, date)
);

-- Create venue_pricing_rules table
CREATE TABLE venue_pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  adjustment_type TEXT NOT NULL,
  adjustment_value INTEGER NOT NULL,
  condition JSONB NOT NULL
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  end_date DATE,
  time_slot TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  price INTEGER NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create venue_visits table
CREATE TABLE venue_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables but allow all operations for now
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_visits ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public can read venue_availability" ON venue_availability FOR SELECT USING (true);
CREATE POLICY "Public can read venue_pricing_rules" ON venue_pricing_rules FOR SELECT USING (true);
CREATE POLICY "Public can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert venue_visits" ON venue_visits FOR INSERT WITH CHECK (true);`}
        </pre>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>After successful initialization, navigate to the Venues page</li>
          <li>View and test the created sample venue</li>
          <li>Try booking the venue to confirm everything is working</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseSetup; 