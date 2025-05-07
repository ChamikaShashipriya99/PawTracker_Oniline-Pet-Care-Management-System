import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Signup validation
export const signupValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  validate
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Admin signup validation
export const adminSignupValidation = [
  ...signupValidation,
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean value'),
  
  validate
];

// Update profile validation
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)
    .withMessage('Please enter a valid phone number'),
  
  validate
];

// Add pet validation
export const addPetValidation = [
  body('petName')
    .trim()
    .notEmpty()
    .withMessage('Pet name is required')
    .isLength({ min: 2 })
    .withMessage('Pet name must be at least 2 characters long'),
  
  body('breed')
    .trim()
    .notEmpty()
    .withMessage('Breed is required'),
  
  body('birthday')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('age')
    .optional()
    .isNumeric()
    .withMessage('Age must be a number'),
  
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number'),
  
  body('specialConditions')
    .optional()
    .trim(),
  
  validate
];

// Contact form validation
export const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long'),
  
  validate
];

// Reset password validation
export const resetPasswordValidation = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  validate
];

// Forgot password validation
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  validate
]; 