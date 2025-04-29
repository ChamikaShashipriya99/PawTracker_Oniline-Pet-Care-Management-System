// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const userRoutes = require('./routes/userRoutes');

// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose.connect('mongodb+srv://Chamika1999:I8qGjr7vC6F9OUaZ@cluster0.nyd4g.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// app.use('/api/users', userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // I8qGjr7vC6F9OUaZ  password

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import path from "path";
import userRoutes from './routes/userRoutes.js'
import advertisementRoutes from './routes/advertisementsRoutes.js'
import { fileURLToPath } from 'url';


// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb+srv://Chamika1999:I8qGjr7vC6F9OUaZ@cluster0.nyd4g.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


  // Routes
app.use('/api/users', userRoutes);
//app.use("/advertisements", advertisementRoutes);

// Routes
console.log("advertisementRoutes:", advertisementRoutes); // Debug
try {
  app.use("/advertisements", advertisementRoutes);
} catch (error) {
  console.error("Error mounting advertisement routes:", error);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));