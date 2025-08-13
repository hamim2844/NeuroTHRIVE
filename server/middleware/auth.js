const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is banned: ' + user.banReason 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

const superAdminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin privileges required.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Super admin auth middleware error:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

module.exports = { auth, adminAuth, superAdminAuth };
