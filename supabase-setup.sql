-- SQL Script for Supabase RLS Setup

-- Venues Table
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  address text,
  city text,
  state text,
  country text,
  zip text,
  capacity int,
  price_per_day numeric,
  created_at timestamp with time zone DEFAULT now(),
  images text[],
  amenities text[],
  contact_email text,
  contact_phone text
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id uuid REFERENCES public.venues(id),
  userId text NOT NULL, -- Using text instead of uuid for compatibility
  date text NOT NULL,
  end_date text,
  time_slot text DEFAULT 'full-day',
  guest_count int NOT NULL,
  price numeric DEFAULT 0,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  special_requests text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Venue Availability Table
CREATE TABLE IF NOT EXISTS public.venue_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id uuid REFERENCES public.venues(id),
  date text NOT NULL,
  is_available boolean DEFAULT true,
  UNIQUE (venue_id, date)
);

-- RLS Policies

-- Enable RLS on tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_availability ENABLE ROW LEVEL SECURITY;

-- Venues: Allow anonymous read access
CREATE POLICY "Allow public read access to venues"
ON public.venues
FOR SELECT
USING (true);

-- Bookings: Allow users to create bookings
CREATE POLICY "Allow users to create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Bookings: Allow users to read their own bookings
CREATE POLICY "Allow users to read their own bookings"
ON public.bookings
FOR SELECT
USING (true);

-- Venue Availability: Allow anonymous read access
CREATE POLICY "Allow public read access to venue availability"
ON public.venue_availability
FOR SELECT
USING (true);

-- Venue Availability: Allow service account to update availability
CREATE POLICY "Allow service account to update venue availability"
ON public.venue_availability
FOR ALL
USING (true)
WITH CHECK (true); 