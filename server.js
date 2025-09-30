import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { connectDB } from './db/connect.js';
import booksRoutes from './routes/books.js';
import authorsRoutes from './routes/authors.js';
import authRoutes from './routes/auth.js';
import passport from './config/passport.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Load Swagger specification
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting Digital Library Management System...');
console.log(`📋 Environment: ${NODE_ENV}`);
console.log(`🔗 Port: ${PORT}`);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Session configuration
console.log('Setting up session management...');
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'library.sid' // Custom session name
}));

// Passport initialization
console.log('Initializing Passport authentication...');
app.use(passport.initialize());
app.use(passport.session());
console.log('Passport authentication initialized successfully');

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend domain
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📝 [${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove any potential sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    console.log(`📝 Request body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  next();
});

// Response time tracking
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusIcon = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusIcon} [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms`);
  });
  
  next();
});

// Authentication Routes
console.log('Setting up authentication routes...');
app.use('/auth', authRoutes);

// API Routes
console.log('Setting up API routes...');
app.use('/api/books', booksRoutes);
app.use('/api/authors', authorsRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Digital Library Management API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Digital Library Management System',
    version: '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Serve authentication test page
app.get('/test-auth', (req, res) => {
  console.log('Authentication test page requested');
  res.sendFile(path.join(process.cwd(), 'test-auth.html'));
});

// Root route with comprehensive API information
app.get('/', (req, res) => {
  console.log('API information requested');
  const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
  
  res.json({ 
    message: 'Digital Library Management System API',
    description: 'A comprehensive library management system with books, authors, and GitHub OAuth authentication',
    version: '1.0.0',
    environment: NODE_ENV,
    documentation: '/api-docs',
    health: '/health',
    authentication: {
      type: 'GitHub OAuth',
      status: isAuthenticated ? 'Authenticated' : 'Not authenticated',
      user: isAuthenticated ? req.user.displayName : null,
      loginUrl: '/auth/github',
      logoutUrl: '/auth/logout',
      profileUrl: '/auth/profile',
      statusUrl: '/auth/status',
      testPage: '/test-auth'
    },
    endpoints: {
      authentication: {
        'GET /auth/github': 'Login with GitHub OAuth',
        'GET /auth/status': 'Check authentication status',
        'GET /auth/profile': 'Get user profile (requires auth)',
        'POST /auth/logout': 'Logout user',
        'GET /auth/users': 'Get all users (admin only)'
      },
      books: {
        'GET /api/books': 'Get all books (public)',
        'GET /api/books/:id': 'Get book by ID (public)',
        'POST /api/books': 'Create new book (requires auth)',
        'PUT /api/books/:id': 'Update book (requires auth)',
        'DELETE /api/books/:id': 'Delete book (requires auth)',
        'POST /api/books/:id/borrow': 'Borrow a book (requires auth)',
        'POST /api/books/:id/return': 'Return a book (requires auth)'
      },
      authors: {
        'GET /api/authors': 'Get all authors (public)',
        'GET /api/authors/:id': 'Get author by ID (public)',
        'POST /api/authors': 'Create new author (requires auth)',
        'PUT /api/authors/:id': 'Update author (requires auth)',
        'DELETE /api/authors/:id': 'Delete author (requires auth)',
        'POST /api/authors/:id/awards': 'Add award to author (requires auth)'
      }
    },
    features: [
      'GitHub OAuth authentication',
      'Session-based user management',
      'Protected API endpoints',
      'Full CRUD operations for books and authors',
      'Advanced validation and error handling',
      'Book borrowing and returning system',
      'Comprehensive filtering and pagination',
      'Rate limiting and security headers',
      'Detailed logging and monitoring',
      'Professional API documentation'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({ 
    success: false,
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log('\n🎉 Digital Library Management System is running!');
      console.log('=' .repeat(60));
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📋 API Info: http://localhost:${PORT}/`);
      console.log('=' .repeat(60));
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🕒 Started at: ${new Date().toISOString()}`);
      console.log('🚀 Ready to handle requests!');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
