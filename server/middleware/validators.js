import { body, validationResult } from 'express-validator';

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User signup validation
const signupValidation = [
  body('firstName')
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage('First name must contain only letters')
    .notEmpty()
    .withMessage('First name is required'),
  
  body('lastName')
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage('Last name must contain only letters')
    .notEmpty()
    .withMessage('Last name is required'),
  
  body('username')
    .trim()
    .matches(/^[A-Za-z0-9]{4,}$/)
    .withMessage('Username must be at least 4 characters and alphanumeric')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .notEmpty()
    .withMessage('Email is required'),
  
  body('phone')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits')
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// User login validation
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .notEmpty()
    .withMessage('Email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Admin signup validation
const adminSignupValidation = [
  body('firstName')
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage('First name must contain only letters')
    .notEmpty()
    .withMessage('First name is required'),
  
  body('lastName')
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage('Last name must contain only letters')
    .notEmpty()
    .withMessage('Last name is required'),
  
  body('username')
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Username must be alphanumeric')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .notEmpty()
    .withMessage('Email is required'),
  
  body('phone')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits')
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Update profile validation
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage('First name must contain only letters'),
  
  body('lastName')
    .optional()
    .trim()
    .matches(/^[A-Za-z]+$/)
    .withMessage('Last name must contain only letters'),
  
  body('username')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Username must be alphanumeric'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  validate
];

// Add pet validation
const addPetValidation = [
  body('petName')
    .trim()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Pet name must contain only letters')
    .notEmpty()
    .withMessage('Pet name is required'),
  
  body('breed')
    .trim()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Breed must contain only letters')
    .notEmpty()
    .withMessage('Breed is required'),
  
  body('birthday')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Birthday must be a past date');
      }
      return true;
    })
    .notEmpty()
    .withMessage('Birthday is required'),
  
  body('age')
    .isFloat({ min: 0 })
    .withMessage('Age must be a positive number')
    .notEmpty()
    .withMessage('Age is required'),
  
  body('weight')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number')
    .notEmpty()
    .withMessage('Weight is required'),
  
  validate
];

// Contact form validation
const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .notEmpty()
    .withMessage('Email is required'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
  
  validate
];

// Reset password validation
const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  validate
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .notEmpty()
    .withMessage('Email is required'),
  
  validate
];

export {
  signupValidation,
  loginValidation,
  adminSignupValidation,
  updateProfileValidation,
  addPetValidation,
  contactValidation,
  resetPasswordValidation,
  forgotPasswordValidation
}; 