import express from 'express';
import passport from '../config/passport.js';
import { jwtAuth, optionalJwtAuth, requireAdmin, generateToken, setTokenCookie, clearTokenCookie } from '../config/jwt-auth.js';
import { connectDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * JWT-Based Authentication Routes
 * Handles GitHub OAuth login with JWT tokens instead of sessions
 */

// Middleware for logging auth requests
router.use((req, res, next) => {
  console.log(`AUTH ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

/**
 * @swagger
 * /auth/github:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Login with GitHub
 *     description: Redirects to GitHub OAuth login page
 *     responses:
 *       302:
 *         description: Redirects to GitHub OAuth
 */
router.get('/github', (req, res, next) => {
  console.log('Initiating GitHub OAuth login...');
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false // Disable session for OAuth
  })(req, res, next);
});

// GitHub OAuth callback route with JWT generation
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/auth/login/failure',
    session: false // Disable session for OAuth
  }),
  (req, res) => {
    try {
      console.log('GitHub OAuth callback successful for:', req.user.displayName);
      
      // Generate JWT token
      const token = generateToken(req.user);
      
      // Set JWT cookie
      setTokenCookie(res, token);
      
      console.log('✅ JWT token generated and set for:', req.user.displayName);
      
      // Redirect to success page or dashboard
      res.redirect('/auth/profile?login=success');
    } catch (error) {
      console.error('❌ Error in OAuth callback:', error.message);
      res.redirect('/auth/login/failure');
    }
  }
);

// Login failure page
router.get('/login/failure', (req, res) => {
  console.log('GitHub OAuth login failed');
  res.status(401).json({
    success: false,
    error: 'Authentication failed',
    message: 'GitHub OAuth login was unsuccessful. Please try again.',
    loginUrl: '/auth/github'
  });
});

/**
 * @swagger
 * /auth/status:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Check authentication status
 *     description: Returns current user authentication status
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 */
router.get('/status', optionalJwtAuth, (req, res) => {
  console.log('Authentication status check');
  
  const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
  
  res.json({
    success: true,
    authenticated: isAuthenticated,
    user: isAuthenticated ? {
      id: req.user._id,
      githubId: req.user.githubId,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    } : null,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get user profile
 *     description: Get authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', jwtAuth, async (req, res) => {
  try {
    console.log('Profile requested for authenticated user:', req.user.displayName);
    
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: req.user._id,
        githubId: req.user.githubId,
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
        profileUrl: req.user.profileUrl,
        avatarUrl: req.user.avatarUrl,
        role: req.user.role,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      },
      authentication: {
        method: 'JWT',
        tokenPresent: !!req.token
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting profile:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logout current user and clear JWT token
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', jwtAuth, (req, res) => {
  try {
    console.log('Logout requested for user:', req.user.displayName);
    
    // Clear JWT cookie
    clearTokenCookie(res);
    
    console.log('✅ User logged out successfully:', req.user.displayName);
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error during logout:', error.message);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /auth/users:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get all users (Admin only)
 *     description: Retrieve all registered users - requires admin privileges
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get('/users', jwtAuth, requireAdmin, async (req, res) => {
  try {
    console.log('Admin user list requested by:', req.user.displayName);
    
    const db = await connectDB();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection
      .find({}, { 
        projection: { 
          accessToken: 0 // Exclude sensitive data
        } 
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`✅ Retrieved ${users.length} users for admin`);
    
    res.json({
      success: true,
      message: `Retrieved ${users.length} users`,
      users: users,
      count: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error retrieving users:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /auth/users/{id}/role:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Update user role (Admin only)
 *     description: Update a user's role - requires admin privileges
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.put('/users/:id/role', jwtAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log(`Admin role update requested by: ${req.user.displayName} for user: ${id}`);
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        message: 'Role must be either "user" or "admin"'
      });
    }
    
    const db = await connectDB();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          role: role,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with the specified ID'
      });
    }
    
    console.log(`✅ Role updated successfully for user: ${id}`);
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      userId: id,
      newRole: role,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role',
      message: error.message
    });
  }
});

export default router;