const express = require("express");
const mongoose = require('mongoose');
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const appointmentRoutes = require('./routes/appointment');

// dotenv config
dotenv.config();

// mongoDB connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'petcare' // Add this line to specify database name
})
    .then(() => {
        console.log('MongoDB Connected Successfully'.bgGreen.white);
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:'.bgRed.white, err);
        process.exit(1); // Exit if unable to connect to database
    });

// Add error handling for MongoDB connection
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:'.bgRed.white, err);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected to database'.bgGreen.white);
});

// rest object
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Test MongoDB connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// routes
app.use('/api/appointment', appointmentRoutes);

// port
const port = process.env.PORT || 8080;

// listen port
app.listen(port, () => {
    console.log(`Server Running on port ${port}`.bgCyan.white);
});