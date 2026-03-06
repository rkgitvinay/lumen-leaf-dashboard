import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';
import propertiesRoutes from './routes/properties.js';
import transactionsRoutes from './routes/transactions.js';
import maintenanceRoutes from './routes/maintenance.js';
import brokersRoutes from './routes/brokers.js';
import auth from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Public
app.use('/api/auth', authRoutes);

// Protected
app.use('/api/stats', auth, statsRoutes);
app.use('/api/properties', auth, propertiesRoutes);
app.use('/api/transactions', auth, transactionsRoutes);
app.use('/api/maintenance', auth, maintenanceRoutes);
app.use('/api/brokers', auth, brokersRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
