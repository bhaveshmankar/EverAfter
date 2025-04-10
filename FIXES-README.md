# Project Fixes Documentation

This document outlines all the fixes that have been implemented to resolve the issues in the project.

## 1. React Router Future Flag Warnings

✅ **Fixed in App.tsx**

Added future flags to the Router component:
```tsx
<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

## 2. 404 on `GET /api/auth/me`

✅ **Fixed in server.js**

Changed the middleware for the `/api/auth/me` endpoint from `middleware.authenticateUser` to `authenticateToken` for consistency with the rest of the application.

## 3. Supabase Error: 401 Unauthorized

✅ **Created supabase-setup.sql**

Created a SQL file with Row Level Security (RLS) policies for Supabase tables:
- Venues table has public read access
- Bookings table allows users to create and read their own bookings
- Venue availability table has public read access

To apply this fix:
1. Log in to your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the script to create tables and set up RLS policies

## 4. Supabase Error: invalid input syntax for type uuid: "2"

✅ **Fixed in bookingService.ts**

Modified the `createBooking` function to:
- Check and convert non-UUID user IDs to valid UUIDs
- Map specific IDs like "2" to fixed UUIDs for consistency
- Log generated mock IDs for debugging

## 5. MongoDB POST Request: 400 Bad Request

✅ **Fixed in VenueBooking.tsx and server.js**

1. In VenueBooking.tsx:
   - Renamed `bookingDate` to `date` in the request payload for consistency
   - Added more detailed logging of the request payload

2. In server.js:
   - Added support for additional fields in the request body
   - Improved error messages by including received data in validation errors
   - Mapped incoming `date` field to `bookingDate` in the MongoDB schema

## 6. Using Generated Mock IDs

This is fallback behavior when Supabase or MongoDB fails. The fixes above should reduce the need for this fallback, but it's kept as a safety mechanism.

## How to Apply These Fixes

1. All code changes have been applied to the respective files
2. For Supabase RLS policies:
   - Run the `supabase-setup.sql` script in the Supabase SQL Editor
   - This will create or update the necessary tables and set proper RLS policies

## Testing the Fixes

After applying these changes:

1. The React Router warnings should disappear
2. The `/api/auth/me` endpoint should work correctly
3. Supabase queries should succeed with proper authentication
4. UUIDs should be handled correctly between MongoDB and Supabase
5. Booking requests should succeed with correct field mapping

If you still encounter issues, check the console logs for more detailed error messages. 