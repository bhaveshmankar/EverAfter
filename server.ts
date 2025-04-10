import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { register, login, getMe } from './src/lib/api/auth';
import { authenticateUser } from './src/lib/middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateUser, getMe);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 