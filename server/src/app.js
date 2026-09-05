import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import comparisonRoutes from './routes/comparisonRoutes.js';
import { query } from './config/db.js';

dotenv.config();

const app = express();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded leaf images statically
const uploadDirName = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.isAbsolute(uploadDirName)
  ? uploadDirName
  : path.join(process.cwd(), uploadDirName);

app.use('/uploads', express.static(uploadPath));

// Healthcheck Route
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      service: 'LeafIQ API Server',
      database: 'connected',
      timestamp: dbRes.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      service: 'LeafIQ API Server',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/scans', questionRoutes);
app.use('/api/scans', assessmentRoutes);
app.use('/api/scans', comparisonRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
