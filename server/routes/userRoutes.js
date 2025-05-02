import express from 'express';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import {
  signupValidation,
  loginValidation,
  adminSignupValidation,
  updateProfileValidation,
  addPetValidation,
  contactValidation,
  resetPasswordValidation,
  forgotPasswordValidation
} from '../middleware/validationMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

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
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

// Email configuration - Using real email service
let transporter;

// Initialize the transporter with your email service
const initializeEmailTransporter = () => {
  try {
    // Gmail configuration with App Password
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'samankumara990209@gmail.com',
        pass: 'lbcyivjbrwnktwgk' // App Password
      }
    });
    
    console.log('Gmail transporter created with direct configuration');
  } catch (error) {
    console.error('Error creating email transporter:', error);
  }
};

// Initialize the transporter
initializeEmailTransporter();

// Regular user signup with photo
router.post('/signup', upload.single('profilePhoto'), signupValidation, async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, phone, password: hashedPassword, profilePhoto });
    await user.save();
    res.status(201).json({ message: 'User created', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user account' });
  }
});

// Admin signup
router.post('/admin/signup', adminSignupValidation, async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, phone, password: hashedPassword, isAdmin: true });
    await user.save();
    res.status(201).json({ 
      message: 'Admin created',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regular user login
router.post('/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      // Generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpiry = Date.now() + 3600000;
      
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
        
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', user.email);
        
        return res.status(403).json({ 
          message: 'Email not verified', 
          email: user.email,
          needsVerification: true
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
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorVerified: user.twoFactorVerified,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login
router.post('/admin/login', loginValidation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, isAdmin: true });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
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
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', upload.single('profilePhoto'), updateProfileValidation, async (req, res) => {
  const { password, ...otherFields } = req.body;
  try {
    const updateData = { ...otherFields };
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    
    if (req.file) {
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: '-password -verificationCode -verificationCodeExpiry -resetToken -resetTokenExpiry' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Ensure createdAt is included in the response
    const userResponse = updatedUser.toObject();
    userResponse.createdAt = updatedUser.createdAt;
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add pet
router.post('/pets', upload.single('petPhoto'), addPetValidation, async (req, res) => {
  try {
    const { userId, name, type, breed, birthday, age, weight, specialConditions } = req.body;
    const petPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    const pet = new Pet({
      name,
      type,
      breed,
      birthday,
      age,
      weight,
      specialConditions,
      photo: petPhoto,
      owner: userId
    });

    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Contact form
router.post('/contact', contactValidation, async (req, res) => {
  try {
    // Here you would typically save the contact form data to a database
    // and/or send an email notification
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', resetPasswordValidation, async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot password
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: '"PawTracker" <noreply@pawtracker.com>',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      message: 'Password reset email sent'
    });
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
router.post('/admin/add', adminSignupValidation, async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  try {
    // Check if user with email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 
          'Email already registered' : 
          'Username already taken'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      firstName, 
      lastName, 
      username, 
      email, 
      phone, 
      password: hashedPassword, 
      isAdmin: true,
      isVerified: true // Automatically verify admin accounts
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Admin created successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      error: 'Failed to create admin account',
      details: error.message 
    });
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

// Get user's pets
router.get('/pets/:userId', async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.params.userId });
    res.json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update pet
router.put('/pets/:id', upload.single('petPhoto'), async (req, res) => {
  const { name, type, breed, birthday, age, weight, specialNeeds } = req.body;
  const petPhoto = req.file ? `/uploads/${req.file.filename}` : req.body.photo;
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { 
        name,
        type,
        breed,
        birthday,
        age,
        weight,
        specialNeeds,
        photo: petPhoto
      },
      { new: true }
    );
    res.json(pet);
  } catch (error) {
    console.error('Error updating pet:', error);
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
      
      await transporter.sendMail(mailOptions);
      console.log('Verification email resent successfully to:', email);
      
      res.json({ 
        message: 'Verification code resent. Please check your email.'
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

// Update pet photo
router.put('/pets/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    const petId = req.params.id;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    if (!photo) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Delete old photo if exists
    if (pet.photo) {
      const oldPhotoPath = path.join(__dirname, '..', pet.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    pet.photo = photo;
    await pet.save();

    res.json(pet);
  } catch (error) {
    console.error('Error updating pet photo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate 2FA secret
router.post('/generate-2fa', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `PawTracker:${user.email}`,
      length: 20
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 15)
    );

    // Save secret and backup codes
    user.twoFactorSecret = secret.base32;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa-setup', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify using speakeasy instead of otpauth
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 period before and after
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorVerified = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify 2FA during login
router.post('/verify-2fa-login', async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA not enabled' });
    }

    // Verify using speakeasy instead of otpauth
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 period before and after
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    res.json({
      message: '2FA verification successful',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disable 2FA
router.post('/disable-2fa', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify using speakeasy instead of otpauth
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 period before and after
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    user.twoFactorVerified = false;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add vaccination
router.post('/pets/:id/vaccinations', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    const vaccination = {
      name: req.body.name,
      date: req.body.date,
      nextDueDate: req.body.nextDueDate,
      notes: req.body.notes,
      isCompleted: req.body.isCompleted
    };

    pet.vaccinations.push(vaccination);
    await pet.save();

    res.status(201).json(pet.vaccinations[pet.vaccinations.length - 1]);
  } catch (error) {
    console.error('Error adding vaccination:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update vaccination
router.put('/pets/:id/vaccinations/:vaccinationId', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    const vaccination = pet.vaccinations.id(req.params.vaccinationId);
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }

    vaccination.set(req.body);
    await pet.save();

    res.json(vaccination);
  } catch (error) {
    console.error('Error updating vaccination:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete vaccination
router.delete('/pets/:id/vaccinations/:vaccinationId', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Find the index of the vaccination to remove
    const vaccinationIndex = pet.vaccinations.findIndex(v => v._id.toString() === req.params.vaccinationId);
    if (vaccinationIndex === -1) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }

    // Remove the vaccination from the array using splice
    pet.vaccinations.splice(vaccinationIndex, 1);
    await pet.save();

    res.json({ message: 'Vaccination deleted' });
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single pet by ID
router.get('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Ensure vaccinations is an array and sort by date
    if (pet.vaccinations && Array.isArray(pet.vaccinations)) {
      pet.vaccinations.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      pet.vaccinations = [];
    }

    res.json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;