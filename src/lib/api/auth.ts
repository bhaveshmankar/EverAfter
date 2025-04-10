import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { connectToDB } from '../mongodb';
import mongoose from 'mongoose';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    // First check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected during registration attempt');
      return res.status(503).json({
        message: 'Database connection error during registration',
        error: 'MongoDB connection unavailable. Please try again later.'
      });
    }
    
    // Try to establish connection
    try {
      await connectToDB();
    } catch (connError) {
      console.error('Failed to connect to MongoDB during registration:', connError);
      return res.status(503).json({
        message: 'Database connection error during registration',
        error: `MongoDB connection failed: ${(connError as Error).message}`
      });
    }
    
    const { name, email, password } = req.body;
    
    // Validate input data
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Server error during registration';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('MongoDB connection failed') || 
          error.name === 'MongoNetworkError' ||
          error.name === 'MongoTimeoutError') {
        errorMessage = 'Database connection error during registration';
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes('buffering timed out')) {
        errorMessage = 'Database operation timed out during registration';
        statusCode = 504; // Gateway Timeout
      } else if (error.name === 'ValidationError') {
        errorMessage = 'Invalid registration data';
        statusCode = 400;
      }
    }

    res.status(statusCode).json({ message: errorMessage, error: (error as Error).message });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    await connectToDB();
    
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: (error as Error).message });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    await connectToDB();
    
    // The user ID is added by the auth middleware
    const userId = (req as any).userId;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user data', error: (error as Error).message });
  }
}; 