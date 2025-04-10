import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Set up __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Dynamic imports for the auth modules
const authModule = await import('./src/lib/api/auth.js');
const middlewareModule = await import('./src/lib/middleware/auth.js');

const { register, login, getMe } = authModule;
const { authenticateUser } = middlewareModule;

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