/**
 * Authentication Middleware
 * Provides middleware functions for protecting routes and checking authentication status
 */

/**
 * Middleware to check if user is authenticated
 * Redirects to login if not authenticated
 */
export const requireAuth = (req, res, next) => {
  console.log('🔒 Checking authentication for:', req.originalUrl);
  console.log('👤 Session user:', req.user ? req.user.displayName : 'Not authenticated');
  
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('✅ User is authenticated, proceeding...');
    return next();
  }
  
  console.log('❌ User not authenticated, sending 401');
  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    message: 'Please log in to access this resource',
    loginUrl: '/auth/github'
  });
};

/**
 * Middleware to check authentication status without blocking
 * Adds user info to request if authenticated
 */
export const optionalAuth = (req, res, next) => {
  console.log('🔍 Optional auth check for:', req.originalUrl);
  console.log('👤 Session user:', req.user ? req.user.displayName : 'Not authenticated');
  
  // Always proceed, authentication is optional
  next();
};

/**
 * Middleware to check if user has admin role
 * Requires authentication first
 */
export const requireAdmin = (req, res, next) => {
  console.log('🔐 Checking admin privileges for:', req.originalUrl);
  
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log('❌ User not authenticated for admin access');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource',
      loginUrl: '/auth/github'
    });
  }
  
  if (req.user.role !== 'admin') {
    console.log('❌ User lacks admin privileges:', req.user.displayName);
    return res.status(403).json({
      success: false,
      error: 'Insufficient privileges',
      message: 'Admin access required for this resource'
    });
  }
  
  console.log('✅ Admin privileges confirmed for:', req.user.displayName);
  next();
};

/**
 * Middleware to ensure user can only access their own resources
 */
export const requireOwnership = (req, res, next) => {
  console.log('🔒 Checking resource ownership for:', req.originalUrl);
  
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log('❌ User not authenticated for ownership check');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // Allow admins to access any resource
  if (req.user.role === 'admin') {
    console.log('✅ Admin override for ownership check');
    return next();
  }
  
  // Check if user ID matches the resource user ID
  const userId = req.params.userId || req.body.userId;
  if (userId && userId !== req.user._id.toString()) {
    console.log('❌ Ownership check failed for:', req.user.displayName);
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'You can only access your own resources'
    });
  }
  
  console.log('✅ Ownership verified for:', req.user.displayName);
  next();
};