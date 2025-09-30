import express from 'express';
import passport from '../config/passport.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { connectDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * Authentication Routes
 * Handles GitHub OAuth login, logout, and user management
 */

// Middleware for logging auth requests
router.use((req, res, next) => {
  console.log(`AUTH ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Login with GitHub OAuth
router.get('/github', (req, res, next) => {
  console.log('Initiating GitHub OAuth login...');
  passport.authenticate('github', { 
    scope: ['user:email']
  })(req, res, next);
});

// GitHub OAuth callback route
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/auth/login/failure' }),
  (req, res) => {
    console.log('GitHub OAuth callback successful for:', req.user.displayName);
    
    // Redirect to success page or dashboard
    res.redirect('/auth/profile?login=success');
  }
);

// Login failure page
router.get('/login/failure', (req, res) => {
  console.log('GitHub OAuth login failed');
  res.status(401).json({
    success: false,
    error: 'Authentication failed',
    message: 'GitHub OAuth login was unsuccessful',
    loginUrl: '/auth/github'
  });
});

// Logout user
router.post('/logout', (req, res) => {
  const userName = req.user ? req.user.displayName : 'Unknown user';
  console.log('Logout requested for:', userName);
  
  if (!req.user) {
    console.log('No active session to logout');
    return res.status(401).json({
      success: false,
      error: 'No active session',
      message: 'You are not currently logged in'
    });
  }
  
  // Passport logout
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: err.message
      });
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Session cleanup failed',
          message: err.message
        });
      }
      
      console.log('User logged out successfully:', userName);
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({
        success: true,
        message: 'Logged out successfully',
        redirectUrl: '/'
      });
    });
  });
});

// Get user profile
router.get('/profile', requireAuth, (req, res) => {
  console.log('Profile requested for:', req.user.displayName);
  
  const userProfile = {
    id: req.user._id,
    githubId: req.user.githubId,
    displayName: req.user.displayName,
    username: req.user.username,
    email: req.user.email,
    avatarUrl: req.user.avatarUrl,
    profileUrl: req.user.profileUrl,
    role: req.user.role,
    createdAt: req.user.createdAt,
    lastLogin: req.user.lastLogin
  };
  
  res.json({
    success: true,
    data: userProfile,
    message: 'Profile retrieved successfully'
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
  console.log('Auth status check - Authenticated:', isAuthenticated);
  
  if (isAuthenticated) {
    console.log('Authenticated user:', req.user.displayName);
  }
  
  res.json({
    success: true,
    authenticated: isAuthenticated,
    user: isAuthenticated ? {
      displayName: req.user.displayName,
      username: req.user.username,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl
    } : null
  });
});

// Get all users (Admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    console.log('Admin user list requested by:', req.user.displayName);
    
    const { db } = await connectDB();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection
      .find({}, { 
        projection: { 
          accessToken: 0 // Don't expose access tokens
        }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Retrieved ${users.length} users for admin`);
    res.json({
      success: true,
      data: users,
      count: users.length,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;