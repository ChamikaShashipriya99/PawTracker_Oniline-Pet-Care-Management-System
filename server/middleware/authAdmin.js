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
    if (!decoded.userId) {
      console.error('Token missing userId', {
        path: req.path,
        method: req.method,
        token: token.substring(0, 10) + '...',
        decoded
      });
      return res.status(401).json({ message: 'Invalid token: Missing userId' });
    }
    req.user = decoded;
    console.log('Token verified for request', {
      path: req.path,
      method: req.method,
      userId: decoded.userId,
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

// Comment out the isAdmin middleware
// exports.isAdmin = (req, res, next) => {
//   const isAdminUser = req.user.isAdmin === true || req.user.role === 'admin';
//   if (!isAdminUser) {
//     console.log(`Access denied for user ${req.user.userId}: isAdmin=${req.user.isAdmin}, role=${req.user.role}`, {
//       path: req.path,
//       method: req.method
//     });
//     return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
//   }
//   next();
// };