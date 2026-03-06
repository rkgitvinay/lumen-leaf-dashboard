import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';
import propertiesRoutes from './routes/properties.js';
import transactionsRoutes from './routes/transactions.js';
import maintenanceRoutes from './routes/maintenance.js';
import brokersRoutes from './routes/brokers.js';
import auth from './middleware/auth.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', auth, statsRoutes);
app.use('/api/properties', auth, propertiesRoutes);
app.use('/api/transactions', auth, transactionsRoutes);
app.use('/api/maintenance', auth, maintenanceRoutes);
app.use('/api/brokers', auth, brokersRoutes);

// Serve built frontend in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
