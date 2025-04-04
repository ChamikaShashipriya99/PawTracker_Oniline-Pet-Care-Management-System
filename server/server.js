const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

// Initialize the app
const app = express();


const corsOptions = {
    origin: 'http://localhost:3000', // Allow React frontend to connect
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

dotenv.config(); // Load environment variables

connectDB(); 

app.use(express.json()); // To parse JSON in the body
app.use('/api/products', productRoutes); 

// Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

