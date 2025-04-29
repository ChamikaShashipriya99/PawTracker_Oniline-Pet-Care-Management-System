import express from 'express';
const router = express.Router();
//import User, { findOne, find, findByIdAndUpdate, findByIdAndDelete } from '../models/User.js';
//import Pet, {findByIdAndUpdate as _findByIdAndUpdate, findByIdAndDelete as _findByIdAndDelete } from '../models/Pet.js';
import { hash, compare } from 'bcryptjs';
import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import { createTransport } from 'nodemailer';
import { randomBytes } from 'crypto';

// Set up multer for file uploads
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ensure 'uploads' directory exists
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('uploads')) {
  mkdirSync('uploads');
}

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

// Email configuration
const transporter = createTransport({
  service: 'Gmail',
  auth: {
    user: 'myactualemail@gmail.com', // Your actual Gmail address
    pass: 'abcd-efgh-ijkl-mnop'      // Your Gmail App Password
  }
});

// Regular user signup with photo
router.post('/signup', upload.single('profilePhoto'), async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const hashedPassword = await hash(password, 10);
    const user = new User({ firstName, lastName, username, email, phone, password: hashedPassword, profilePhoto });
    await user.save();
    res.status(201).json({ message: 'User created', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin signup (no photo for simplicity)
router.post('/admin/signup', async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
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
    const user = await findOne({ email });
    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, phone: user.phone, isAdmin: user.isAdmin, profilePhoto: user.profilePhoto } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findOne({ email, isAdmin: true });
    if (!user || !(await compare(password, user.password))) {
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
  try {
    const user = await findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'myactualemail@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset for your Online Pet Care account.</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
        <p>If you did not request this, please ignore this email. The link expires in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await hash(password, 10);
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
    const users = await find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new admin (admin only)
router.post('/admin/add', async (req, res) => {
  const { firstName, lastName, username, email, phone, password } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
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
      const hashedPassword = await hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    await findByIdAndDelete(req.params.id);
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
    const pets = await _find({ userId: req.params.userId });
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
    const pet = await _findByIdAndUpdate(req.params.id, { petName, breed, birthday, age, weight, specialConditions, petPhoto }, { new: true });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pet
router.delete('/pets/:id', async (req, res) => {
  try {
    await _findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;