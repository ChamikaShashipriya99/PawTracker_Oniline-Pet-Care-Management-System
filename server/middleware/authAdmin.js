const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('No token provided in request', {
      path: req.path,
      method: req.method
    });
    return res.status(401).json({ message: 'Authentication required: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pawtracker_secret_key_2024');
    console.log('Decoded token:', decoded);

    // Support both decoded.userId and decoded.id
    let userId = decoded.userId || decoded.id;

    // Fallback to x-user-id header if userId is not in the token
    if (!userId) {
      userId = req.headers['x-user-id'];
      if (!userId) {
        console.error('Token and x-user-id missing userId/id', {
          path: req.path,
          method: req.method,
          token: token.substring(0, 10) + '...',
          decoded
        });
        return res.status(401).json({ message: 'Invalid token: Missing user identification' });
      }
      console.log('Using x-user-id as fallback:', userId);

      // Validate x-user-id as a MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid x-user-id format', { userId });
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
    }

    // Add userId to the decoded object for consistency
    decoded.userId = userId;
    req.user = decoded;

    console.log('Token verified for request', {
      path: req.path,
      method: req.method,
      userId: userId,
      email: decoded.email,
      isVerified: decoded.isVerified,
      role: decoded.role,
      isAdmin: decoded.isAdmin,
      token: token.substring(0, 10) + '...'
    });
    next();
  } catch (error) {
    console.error('Token verification failed for request', {
      path: req.path,
      method: req.method,
      message: error.message,
      token: token ? token.substring(0, 10) + '...' : 'No token',
      stack: error.stack
    });
    res.status(401).json({ message: `Authentication failed: ${error.message}` });
  }
};