const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pet = require('../models/Pet');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ensure 'uploads' directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

// Email configuration - Using Ethereal Email for testing
let transporter;

// Create a test account on Ethereal Email
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal Email test account created:', testAccount.user);
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Ethereal Email transporter created successfully');
  } catch (error) {
    console.error('Error creating Ethereal Email test account:', error);
  }
};

// Initialize the transporter
createTestAccount();

// Regular user signup with photo
router.post('/signup', upload.single('profilePhoto'), async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const verificationCodeExpiry = Date.now() + 3600000; // 1 hour expiry
    
    const user = new User({ 
      firstName, 
      lastName, 
      username, 
      email, 
      phone, 
      password: hashedPassword, 
      profilePhoto,
      verificationCode,
      verificationCodeExpiry,
      isVerified: false
    });
    
    await user.save();
    
    // Send verification email
    const mailOptions = {
      from: '"PawTracker" <noreply@pawtracker.com>',
      to: email,
      subject: 'Verify Your PawTracker Account',
      html: `
        <h2>Welcome to PawTracker!</h2>
        <p>Thank you for registering. Please verify your email address by entering the following code:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not create this account, please ignore this email.</p>
      `
    };
    
    try {
      if (!transporter) {
        console.log('Transporter not initialized yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully to:', email);
      
      // Return user data without sensitive information
      const userResponse = { 
        ...user.toObject(), 
        password: undefined,
        verificationCode: undefined
      };
      
      res.status(201).json({ 
        message: 'User created. Please verify your email.', 
        user: userResponse,
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Still create the user, but inform about email sending failure
      res.status(201).json({ 
        message: 'User created but verification email could not be sent. Please contact support.', 
        user: { ...user.toObject(), password: undefined, verificationCode: undefined }
      });
    }
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin signup (no photo for simplicity)
router.post('/admin/signup', async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, phone, password: hashedPassword, isAdmin: true });
    await user.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regular user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      // Generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      const verificationCodeExpiry = Date.now() + 3600000; // 1 hour expiry
      
      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = verificationCodeExpiry;
      await user.save();
      
      // Send verification email
      const mailOptions = {
        from: '"PawTracker" <noreply@pawtracker.com>',
        to: user.email,
        subject: 'Verify Your PawTracker Account',
        html: `
          <h2>Welcome to PawTracker!</h2>
          <p>Thank you for registering. Please verify your email address by entering the following code:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not create this account, please ignore this email.</p>
        `
      };
      
      try {
        if (!transporter) {
          console.log('Transporter not initialized yet, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', user.email);
        
        return res.status(403).json({ 
          message: 'Email not verified', 
          email: user.email,
          needsVerification: true,
          previewUrl: nodemailer.getTestMessageUrl(info)
        });
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return res.status(403).json({ 
          message: 'Email not verified and could not send verification email', 
          email: user.email,
          needsVerification: true
        });
      }
    }
    
    res.json({ 
      user: { 
        _id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        username: user.username, 
        email: user.email, 
        phone: user.phone, 
        isAdmin: user.isAdmin, 
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, isAdmin: true });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    res.json({ user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, phone: user.phone, isAdmin: user.isAdmin, profilePhoto: user.profilePhoto } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Forgot password request for email:', email);
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user._id);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    console.log('Reset token saved for user:', user._id);

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: '"PawTracker" <noreply@pawtracker.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset for your Online Pet Care account.</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
        <p>If you did not request this, please ignore this email. The link expires in 1 hour.</p>
      `
    };

    console.log('Attempting to send email to:', email);
    try {
      if (!transporter) {
        console.log('Transporter not initialized yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for transporter to initialize
      }
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      res.json({ 
        message: 'Reset link sent to your email',
        previewUrl: nodemailer.getTestMessageUrl(info) // Include the preview URL in the response
      });
    } catch (emailError) {
      console.error('Email error details:', emailError);
      res.status(500).json({ message: 'Failed to send email', error: emailError.message });
    }
  } catch (error) {
    console.error('Server error details:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new admin (admin only)
router.post('/admin/add', async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, phone, password: hashedPassword, isAdmin: true });
    await user.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin or self, with password update)
router.put('/:id', async (req, res) => {
  const { password, ...otherFields } = req.body; // Separate password from other fields
  try {
    const updateData = { ...otherFields };
    
    // If password is provided, hash it and add to update data
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without the password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add pet with photo
router.post('/pets', upload.single('petPhoto'), async (req, res) => {
  const { userId, petName, breed, birthday, age, weight, specialConditions } = req.body;
  const petPhoto = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const pet = new Pet({ userId, petName, breed, birthday, age, weight, specialConditions, petPhoto });
    await pet.save();
    res.status(201).json({ message: 'Pet added', pet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's pets
router.get('/pets/:userId', async (req, res) => {
  try {
    const pets = await Pet.find({ userId: req.params.userId });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pet
router.put('/pets/:id', upload.single('petPhoto'), async (req, res) => {
  const { petName, breed, birthday, age, weight, specialConditions } = req.body;
  const petPhoto = req.file ? `/uploads/${req.file.filename}` : req.body.petPhoto;
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, { petName, breed, birthday, age, weight, specialConditions, petPhoto }, { new: true });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pet
router.delete('/pets/:id', async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    const user = await User.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();
    
    res.json({ 
      message: 'Email verified successfully',
      user: { 
        _id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        username: user.username, 
        email: user.email, 
        phone: user.phone, 
        isAdmin: user.isAdmin, 
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const verificationCodeExpiry = Date.now() + 3600000; // 1 hour expiry
    
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();
    
    // Send verification email
    const mailOptions = {
      from: '"PawTracker" <noreply@pawtracker.com>',
      to: email,
      subject: 'Verify Your PawTracker Account',
      html: `
        <h2>Welcome to PawTracker!</h2>
        <p>Thank you for registering. Please verify your email address by entering the following code:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not create this account, please ignore this email.</p>
      `
    };
    
    try {
      if (!transporter) {
        console.log('Transporter not initialized yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email resent successfully to:', email);
      
      res.json({ 
        message: 'Verification code resent. Please check your email.',
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email', error: emailError.message });
    }
  } catch (error) {
    console.error('Error during resending verification code:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

module.exports = router;