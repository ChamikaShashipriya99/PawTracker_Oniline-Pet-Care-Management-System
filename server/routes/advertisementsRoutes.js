import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Advertisement from '../models/Advertisement.js';
import requirePhoto from '../middleware/requirePhoto.js';
import cors from 'cors';

const router = express.Router();

// Enable CORS for all routes
router.use(cors());

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// Error handling middleware for Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        details: 'Maximum file size is 5MB'
      });
    }
    return res.status(400).json({ 
      error: 'Upload error',
      details: err.message
    });
  }
  if (err.message.includes('Only JPEG, PNG, and GIF images are allowed')) {
    return res.status(400).json({ 
      error: 'Invalid file type',
      details: err.message
    });
  }
  next(err);
};

// Apply error handling middleware
router.use(handleMulterError);

// Get all advertisements
router.get('/', async (req, res) => {
  try {
    const advertisements = await Advertisement.find({});
    return res.status(200).json({ data: advertisements });
  } catch (error) {
    console.error('Error fetching advertisements:', error.stack);
    res.status(500).json({ message: 'Server error fetching advertisements' });
  }
});

// Create new advertisement
router.post('/', upload.single('photo'), requirePhoto, async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Please fill all required fields'
      });
    }

    // Validate advertisementType
    const validTypes = ['Sell a Pet', 'Lost Pet', 'Found Pet'];
    if (!validTypes.includes(advertisementType)) {
      return res.status(400).json({ 
        error: 'Invalid advertisement type',
        details: 'Please select a valid advertisement type'
      });
    }

    // Require petType for "Sell a Pet"
    if (advertisementType === 'Sell a Pet' && !petType) {
      return res.status(400).json({ 
        error: 'Pet type required',
        details: 'Pet type is required for selling a pet'
      });
    }

    // Validate photo
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Photo required',
        details: 'Please upload a photo'
      });
    }

    const newAdvertisement = new Advertisement({
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === 'Sell a Pet' ? petType : '',
      heading,
      description,
      photo: req.file.filename
    });

    const advertisement = await newAdvertisement.save();
    
    res.status(201).json({
      message: 'Advertisement created successfully',
      advertisement: {
        id: advertisement._id,
        name: advertisement.name,
        email: advertisement.email,
        advertisementType: advertisement.advertisementType,
        heading: advertisement.heading,
        status: advertisement.status
      }
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Server error',
      details: 'Error creating advertisement'
    });
  }
});

// Get advertisement by ID
router.get('/details/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json(advertisement);
  } catch (error) {
    console.error('Error fetching advertisement:', error.stack);
    res.status(500).json({ message: 'Server error fetching advertisement' });
  }
});

// Get advertisements by email
router.get('/my-ads/:email', async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ email: req.params.email });
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error('Error fetching user advertisements:', error.stack);
    res.status(500).json({ message: 'Server error fetching user advertisements' });
  }
});

// Update advertisement
router.put('/edit/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Validate advertisementType
    const validTypes = ['Sell a Pet', 'Lost Pet', 'Found Pet'];
    if (!validTypes.includes(advertisementType)) {
      return res.status(400).json({ message: 'Invalid advertisement type' });
    }

    // Require petType for "Sell a Pet"
    if (advertisementType === 'Sell a Pet' && !petType) {
      return res.status(400).json({ message: 'Pet type is required for selling a pet' });
    }

    const updateData = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === 'Sell a Pet' ? petType : '',
      heading,
      description,
    };
    if (req.file) updateData.photo = req.file.filename;

    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json({ message: 'Advertisement updated successfully' });
  } catch (error) {
    console.error('Error updating advertisement:', error.stack);
    res.status(500).json({ message: 'Server error updating advertisement' });
  }
});

// Approve advertisement
router.put('/approve/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json({ message: 'Advertisement approved successfully' });
  } catch (error) {
    console.error('Error approving advertisement:', error.stack);
    res.status(500).json({ message: 'Server error approving advertisement' });
  }
});

// Reject advertisement
router.put('/reject/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json({ message: 'Advertisement rejected successfully' });
  } catch (error) {
    console.error('Error rejecting advertisement:', error.stack);
    res.status(500).json({ message: 'Server error rejecting advertisement' });
  }
});

// Mark advertisement as paid
router.put('/pay/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { paymentStatus: 'Paid' }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json({ message: 'Advertisement marked as paid' });
  } catch (error) {
    console.error('Error marking payment:', error.stack);
    res.status(500).json({ message: 'Server error marking payment' });
  }
});

// Update advertisement status
router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json({ message: `Advertisement ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error updating advertisement status:', error.stack);
    res.status(500).json({ message: 'Server error updating advertisement status' });
  }
});

// Delete advertisement
router.delete('/delete/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    return res.status(200).json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error.stack);
    res.status(500).json({ message: 'Server error deleting advertisement' });
  }
});

export default router;

// const express = require('express');
// const router = express.Router();
// const advertisementController = require('../controllers/AdvertisementController');

// router.get('/', advertisementController.getAllAdvertisements);
// router.get('/:id', advertisementController.getUserAdvertisements);
// router.post('/', advertisementController.createAdvertisement);
// router.put('/:id', advertisementController.editAdvertisement);
// router.delete('/:id', advertisementController.deleteAdvertisement);

// module.exports = router;