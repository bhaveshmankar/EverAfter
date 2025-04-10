-- Fix Venues RLS policies
-- Allow authenticated users to insert venues
CREATE POLICY "Allow insert for authenticated users"
ON public.venues
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Modify bookings policies to include proper checks
CREATE POLICY "Allow bookings for existing venues"
ON public.bookings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.venues WHERE id = venue_id
  )
);

-- Add a policy for users to see only their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING ("userId"::uuid = auth.uid());

-- Add a policy for users to update their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING ("userId"::uuid = auth.uid())
WITH CHECK ("userId"::uuid = auth.uid()); 