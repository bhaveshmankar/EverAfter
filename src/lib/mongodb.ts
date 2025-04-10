import mongoose from 'mongoose';

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;

export const connectToDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    
    // Improved connection options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
      connectTimeoutMS: 30000, // 30 seconds for initial connection
      heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
      retryWrites: true,
      writeConcern: {
        w: 'majority'
      }
    });
    
    isConnected = true;
    retryCount = 0;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    
    // Implement retry logic
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
      
      // Exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Try again
      return connectToDB();
    }
    
    // Reset connection status
    isConnected = false;
    
    // Re-throw the error so the calling function knows connection failed
    throw new Error(`MongoDB connection failed: ${(error as Error).message}`);
  }
}; 