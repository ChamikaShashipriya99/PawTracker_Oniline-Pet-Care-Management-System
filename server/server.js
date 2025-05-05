require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/payment');
const refundRoutes = require('./routes/refund');

//Set JWT secret
process.env.JWT_SECRET = 'pawtracker_secret_key_2024';

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from 'Uploads' directory
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb+srv://Chamika1999:I8qGjr7vC6F9OUaZ@cluster0.nyd4g.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refund', refundRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));