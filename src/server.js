import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import contactRoutes from './routes/contactRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// SECURITY HEADERS: Helmet adds common protective HTTP headers.
app.use(helmet());

// CORS: in production, set CLIENT_URL to your exact deployed frontend origin(s).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin (e.g. health checks / curl) are allowed.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by the API CORS policy.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// REQUEST PARSING: cap JSON payload size to reduce accidental/abusive large submissions.
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// RATE LIMIT: limits repeated form submissions from a single IP.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages sent. Please try again later.' },
});

// HEALTH CHECK: use GET /api/health to verify that the backend process is running.
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Portfolio API is running.', data: { database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' } });
});

app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api', notFoundHandler);
app.use(errorHandler);

// DATABASE CONNECTION: the API starts only after MongoDB connects, so contact submissions do not silently fail.
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing. Add it to backend/.env.');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`✅ Portfolio API listening at http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start portfolio API:', error.message);
    process.exit(1);
  }
}

startServer();
