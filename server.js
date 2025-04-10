import express from 'express';
import cors from 'cors';
import path from 'path';
import * as auth from './auth.js';
import * as middleware from './middleware.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { networkInterfaces } from 'os';

// Load environment variables
dotenv.config();

// Environment variables
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding-planner';

// Initialize Express
const app = express();

// Configure CORS
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      'https://weddingplanner.vercel.app'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`);
      // Allow anyway in development for easier debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Allowing in development mode despite not being in whitelist');
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true, // Allow cookies to be sent
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// MongoDB Connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'None');
  
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    console.log('JWT verified successfully, user data:', user);
    req.userId = user.userId;
    console.log('Setting req.userId to:', req.userId);
    next();
  });
};

// Add a test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is working!' });
});

// Simple root health check for quick connection testing
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  console.log('Register request received:', req.body);
  auth.register(req, res);
});
app.post('/api/auth/login', auth.login);
app.get('/api/auth/me', middleware.authenticateUser, auth.getMe);

// Public venue routes
app.get('/api/venues', (req, res) => {
  // Get all venues - public endpoint
  res.json({ message: 'Public venues endpoint' });
});

app.get('/api/venues/:id', (req, res) => {
  // Get specific venue - public endpoint
  res.json({ message: `Public venue details for ID: ${req.params.id}` });
});

// Add the MongoDB booking model
const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  venueId: {
    type: String,
    required: true
  },
  guestCount: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: String, // or Date, depending on your needs
    required: true
  },
  endDate: {
    type: String, // or Date
    default: null
  },
  timeSlot: {
    type: String,
    default: 'full-day'
  },
  price: {
    type: Number,
    default: 0
  },
  contactName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  specialRequests: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'Pending'
  },
  venueName: String,
  location: String,
  serviceType: {
    type: String,
    default: 'Venue'
  },
  visitScheduled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', BookingSchema);

// Make sure this is added to verify the routes
app.get('/api/routes', (req, res) => {
  // List all registered routes for debugging
  const routes = [];
  app._router.stack.forEach(middleware => {
    if(middleware.route) {
      // Routes registered directly
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if(middleware.name === 'router') {
      // Routes added via router
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    routes,
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Protected booking routes - updated to use MongoDB
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/bookings received request:', req.body);
    
    // Extract booking data from request
    const { 
      venueId, bookingDate, endDate, timeSlot, guestCount, price, 
      contactName, contactEmail, contactPhone, specialRequests,
      venueName, location, serviceType, visitScheduled, userId: clientUserId
    } = req.body;
    
    // Use either the user ID from the token or from the request (for backward compatibility)
    const userId = req.userId || clientUserId;
    
    // Validate required fields
    if (!venueId || !bookingDate || !guestCount || !contactName || !contactEmail) {
      return res.status(400).json({ message: 'Missing required booking information' });
    }
    
    console.log('Creating venue booking in MongoDB:', { userId, venueId, bookingDate });
    
    // Create a booking in MongoDB
    try {
      const newBooking = new Booking({
        userId,
        venueId,
        bookingDate,
        endDate: endDate || null,
        timeSlot: timeSlot || 'full-day',
        guestCount,
        price: price || 0,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || null,
        status: 'Pending',
        venueName: venueName || "Requested Venue",
        location: location || "Venue Location",
        serviceType: serviceType || 'Venue',
        visitScheduled: visitScheduled || false
      });
      
      const savedBooking = await newBooking.save();
      console.log('Booking saved to MongoDB with ID:', savedBooking._id);
      
      res.status(201).json({
        message: 'Venue booking created successfully',
        booking: savedBooking
      });
    } catch (mongoError) {
      console.error('Error saving to MongoDB:', mongoError);
      res.status(500).json({ message: 'Error creating booking in database', error: mongoError.message });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get user's bookings - updated to use MongoDB
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching bookings for user ID:', userId);
    
    try {
      // Query MongoDB for this user's bookings
      const userBookings = await Booking.find({ userId }).sort({ createdAt: -1 });
      console.log(`Found ${userBookings.length} bookings for user ${userId} in MongoDB`);
      
      // Format the bookings for the frontend
      const formattedBookings = userBookings.map(booking => ({
        _id: booking._id,
        userId: booking.userId,
        serviceType: booking.serviceType || 'Venue',
        serviceName: booking.venueName || 'Wedding Venue',
        date: booking.bookingDate,
        location: booking.location || 'Venue Location',
        guestCount: booking.guestCount,
        status: booking.status || 'Pending',
        priceEstimate: booking.price || 0,
        imageUrl: `https://source.unsplash.com/random/600x400/?venue`,
        createdAt: booking.createdAt
      }));
      
      // If no bookings found and in development, add a sample
      if (formattedBookings.length === 0 && process.env.NODE_ENV !== 'production') {
        console.log('No bookings found, adding a sample booking for development');
        formattedBookings.push({
          _id: 'sample-booking-1',
          userId,
          serviceType: 'Venue',
          serviceName: 'Sample Venue Booking',
          date: new Date().toISOString(),
          location: 'New Delhi',
          guestCount: 100,
          status: 'Pending',
          priceEstimate: 50000,
          imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
          createdAt: new Date().toISOString(),
          isSampleData: true
        });
      }
      
      res.json(formattedBookings);
    } catch (mongoError) {
      console.error('MongoDB query error:', mongoError);
      res.status(500).json({ message: 'Error fetching bookings from database', error: mongoError.message });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Cancel booking - updated to use MongoDB
app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;
    
    console.log(`Cancelling booking ${bookingId} for user ${userId}`);
    
    // Find and update the booking in MongoDB
    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not owned by this user' });
    }
    
    booking.status = 'Cancelled';
    await booking.save();
    
    res.json({ 
      message: 'Booking cancelled successfully', 
      bookingId,
      status: 'Cancelled'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

// Health check endpoint with detailed diagnostics
app.get('/api/health', (req, res) => {
  // Get server uptime
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);
  
  // Check MongoDB connection
  const isMongoConnected = mongoose.connection.readyState === 1;
  
  // Get memory usage
  const memoryUsage = process.memoryUsage();
  
  // Return comprehensive health status
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    uptimeSeconds: uptime,
    mongodb: {
      connected: isMongoConnected,
      status: isMongoConnected ? 'connected' : 'disconnected'
    },
    environment: process.env.NODE_ENV || 'development',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    }
  });
});

// Helper function to format uptime in a readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  const mins = Math.floor(seconds / 60);
  seconds -= mins * 60;
  seconds = Math.floor(seconds);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hrs > 0) result += `${hrs}h `;
  if (mins > 0) result += `${mins}m `;
  result += `${seconds}s`;
  
  return result;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Add a test booking route that doesn't require auth for testing
app.post('/api/test-booking', async (req, res) => {
  try {
    console.log('Test booking received:', req.body);
    res.status(200).json({ 
      message: 'Test booking endpoint reached successfully', 
      received: req.body 
    });
  } catch (error) {
    console.error('Error in test booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// MongoDB connection and server start
(async () => {
  // Try to connect to MongoDB but continue even if it fails
  const mongoConnected = await connectToMongoDB();
  
  if (!mongoConnected) {
    console.warn('⚠️ WARNING: Server starting without MongoDB connection! Authentication features may not work correctly.');
  }
  
  // Start server with improved error handling
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Server also accessible at http://${getLocalIPAddress()}:${PORT}`);
    console.log(`MongoDB connection status: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ ERROR: Port ${PORT} is already in use! Please try a different port.`);
    } else {
      console.error('❌ Server error:', err);
    }
  });

  // Helper function to get local IP address for debugging
  function getLocalIPAddress() {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip internal and non-IPv4 addresses
        if (!net.internal && net.family === 'IPv4') {
          return net.address;
        }
      }
    }
    return '127.0.0.1';
  }
})(); 