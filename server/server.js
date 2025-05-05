// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import advertisementRoutes from './routes/advertisementsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import supplierRoutes from './routes/suppliers.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

process.env.JWT_SECRET = 'pawtracker_secret_key_2024';

// Database connection
mongoose.connect('mongodb+srv://Chamika1999:I8qGjr7vC6F9OUaZ@cluster0.nyd4g.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Increase JSON payload limit for handling large images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/suppliers', supplierRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));