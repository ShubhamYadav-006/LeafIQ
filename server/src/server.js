import app from './app.js';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`LeafIQ Backend Server Running`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down server gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('PostgreSQL connection pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing PostgreSQL pool:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
