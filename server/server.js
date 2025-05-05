require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/payment');
const refundRoutes = require('./routes/refund');
const inventoryRoutes = require('./routes/inventoryRoutes');
const storeRoutes = require('./routes/storeRoutes');
const supplierRoutes = require('./routes/suppliers');

//Set JWT secret
process.env.JWT_SECRET = 'pawtracker_secret_key_2024';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Increase JSON payload limit for handling large images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refund', refundRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/suppliers', supplierRoutes);

mongoose.connect('mongodb+srv://Chamika1999:I8qGjr7vC6F9OUaZ@cluster0.nyd4g.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));