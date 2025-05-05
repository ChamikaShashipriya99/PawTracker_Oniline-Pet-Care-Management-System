import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(verified._id || verified.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = {
        id: user._id,
        isAdmin: user.isAdmin
      };
      
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

export default auth; 