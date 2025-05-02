// Remove dotenv requirement
// require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

app.use(cors());
app.use(express.json());

process.env.JWT_SECRET = 'pawtracker_secret_key_2024';

// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb+srv://Chamika1999:I8qGjr7vC6F9OUaZ@cluster0.nyd4g.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));