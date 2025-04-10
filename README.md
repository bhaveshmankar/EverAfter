# Wedding Planner App with Supabase

A modern wedding planning application built with React, TypeScript, and Supabase for the backend.

## Features

- Venue discovery and booking
- Real-time availability updates
- Dynamic pricing based on rules
- Multi-step booking flow
- Venue visit requests

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to the SQL Editor in your Supabase dashboard
4. Run the SQL script in `src/pages/admin/DatabaseSetup.tsx` to create all necessary tables

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update the values in `.env.local` with your Supabase project details:
   - Get the `VITE_SUPABASE_URL` from your Supabase project settings
   - Get the `VITE_SUPABASE_ANON_KEY` from your Supabase project API settings

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Initialize Database

1. Navigate to `/admin/database-setup` in your browser
2. Click "Test Connection" to verify your Supabase connection
3. Click "Initialize Collections" to create sample data

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components for each route
- `/src/lib` - Utility functions, services, and types
  - `/services` - API functions for Supabase interactions
  - `/types` - TypeScript type definitions
- `/src/assets` - Static assets like images

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- React Router
- React Calendar
- Lucide React (icons)
- React Hot Toast (notifications)

## MongoDB Connection Troubleshooting

### Fix 503 Service Unavailable Error During Registration

If you're encountering a 503 Service Unavailable error during user registration, there's likely an issue with the MongoDB connection. Follow these steps to resolve it:

#### 1. Whitelist Your IP in MongoDB Atlas

The error message suggests that your IP address is not whitelisted in MongoDB Atlas:

```
Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

To fix this:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with the credentials used to create the cluster
3. Select your cluster (cluster0)
4. Go to "Network Access" in the left sidebar
5. Click "Add IP Address"
6. Add your current IP address OR use `0.0.0.0/0` to allow connections from anywhere (not recommended for production)
7. Click "Confirm"

#### 2. Alternative: Use a Local MongoDB Instance

If you can't access MongoDB Atlas or prefer to work locally:

1. [Install MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/) on your machine
2. Start the MongoDB service with `mongod`
3. Modify the .env file to use a local connection:

```
MONGODB_URI=mongodb://localhost:27017/weddingplanner
```

#### 3. Other Potential Solutions

If the above steps don't work:

1. **Check your MongoDB Atlas username and password**: Ensure they're correct and special characters are properly encoded
2. **Check for network restrictions**: Ensure your network allows outbound connections to MongoDB Atlas (port 27017)
3. **Verify the cluster is running**: Check the cluster status in MongoDB Atlas dashboard
4. **Try a different MongoDB Atlas connection string format**: Use the connection string directly from MongoDB Atlas UI

For more information on MongoDB connection troubleshooting, see the [MongoDB documentation](https://www.mongodb.com/docs/drivers/node/current/connection-troubleshooting/)

## License

MIT 