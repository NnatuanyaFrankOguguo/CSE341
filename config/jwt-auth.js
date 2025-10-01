/**
 * JWT Authentication Configuration
 * Alternative to session-based authentication for better production reliability
 */

import jwt from 'jsonwebtoken';
import { connectDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_COOKIE_EXPIRES = process.env.JWT_COOKIE_EXPIRES || 7; // days

/**
 * Generate JWT token for user
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    githubId: user.githubId,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'digital-library-api',
    audience: 'digital-library-users'
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'digital-library-api',
      audience: 'digital-library-users'
    });
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
};

/**
 * Set JWT token in cookie
 */
export const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };

  res.cookie('jwt', token, cookieOptions);
};

/**
 * Clear JWT token cookie
 */
export const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
};

/**
 * Get token from request (cookie or Authorization header)
 */
export const getTokenFromRequest = (req) => {
  let token = null;

  // Check cookie first
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  // Check Authorization header as fallback
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  return token;
};

/**
 * Get user from database by ID
 */
export const getUserById = async (userId) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    return null;
  }
};

/**
 * Middleware to protect routes with JWT
 */
export const jwtAuth = async (req, res, next) => {
  try {
    console.log('🔒 JWT Auth check for:', req.originalUrl);
    
    const token = getTokenFromRequest(req);
    
    if (!token) {
      console.log('❌ No JWT token found');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource',
        loginUrl: '/auth/github'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Invalid JWT token');
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please log in again',
        loginUrl: '/auth/github'
      });
    }

    // Get fresh user data from database
    const user = await getUserById(decoded.id);
    
    if (!user) {
      console.log('❌ User not found for JWT token');
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Please log in again',
        loginUrl: '/auth/github'
      });
    }

    // Add user to request
    req.user = user;
    req.token = token;
    req.isAuthenticated = () => true;
    
    console.log('✅ JWT authentication successful for:', user.displayName);
    next();
  } catch (error) {
    console.error('❌ JWT authentication error:', error.message);
    clearTokenCookie(res);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Please try logging in again'
    });
  }
};

/**
 * Optional JWT authentication middleware
 */
export const optionalJwtAuth = async (req, res, next) => {
  try {
    console.log('🔍 Optional JWT auth check for:', req.originalUrl);
    
    const token = getTokenFromRequest(req);
    
    if (token) {
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await getUserById(decoded.id);
        if (user) {
          req.user = user;
          req.token = token;
          req.isAuthenticated = () => true;
          console.log('✅ Optional JWT authentication successful for:', user.displayName);
        }
      }
    }
    
    if (!req.user) {
      req.isAuthenticated = () => false;
      console.log('📝 No valid JWT authentication, proceeding without user');
    }
    
    next();
  } catch (error) {
    console.error('❌ Optional JWT authentication error:', error.message);
    req.isAuthenticated = () => false;
    next();
  }
};

/**
 * Admin role check middleware (requires JWT auth first)
 */
export const requireAdmin = (req, res, next) => {
  console.log('🔐 Checking admin privileges for:', req.originalUrl);
  
  if (!req.user) {
    console.log('❌ User not authenticated for admin access');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'admin') {
    console.log('❌ User does not have admin privileges:', req.user.displayName);
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }

  console.log('✅ Admin access granted for:', req.user.displayName);
  next();
};

export default {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
  getTokenFromRequest,
  getUserById,
  jwtAuth,
  optionalJwtAuth,
  requireAdmin
};