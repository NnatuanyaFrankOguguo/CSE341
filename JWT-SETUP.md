# JWT Authentication Setup Instructions

## Quick Switch to JWT Authentication

Your current session-based authentication is having persistence issues. Here's how to switch to a more reliable JWT-based system:

### 1. Install Required Packages
```bash
npm install jsonwebtoken cookie-parser
```

### 2. Update Your Environment Variables
Copy the JWT template and update your `.env` file:
```bash
cp .env.jwt-template .env
```

Add these new JWT configuration variables to your `.env`:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-very-long-and-random
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES=7
```

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Switch to JWT Server
Replace your current `server.js` with the JWT version:
```bash
# Backup your current server
cp server.js server-sessions-backup.js

# Use the JWT version
cp server-jwt.js server.js
```

### 4. Start the Server
```bash
npm start
```

## How JWT Authentication Works

### Advantages over Sessions:
1. **Stateless**: No server-side session storage needed
2. **Scalable**: Works better in production/multi-server environments
3. **Reliable**: No session deserialization issues
4. **Production Ready**: Better for deployment platforms like Render, Heroku, etc.

### Security Features:
- HTTP-only cookies (prevents XSS attacks)
- Secure cookies in production (HTTPS only)
- Token expiration (7 days by default)
- Authorization header support for API clients

### Authentication Flow:
1. User clicks login → redirects to GitHub OAuth
2. GitHub redirects back with user data
3. Server generates JWT token with user info
4. JWT stored in HTTP-only cookie
5. All subsequent requests include the JWT
6. Server verifies JWT on each request

## Testing the JWT Authentication

### 1. Login Flow:
- Visit: http://localhost:3000/auth/github
- Complete GitHub OAuth
- Get redirected to profile with JWT token

### 2. Check Status:
```bash
curl http://localhost:3000/auth/status
```

### 3. Access Protected Route:
```bash
curl http://localhost:3000/auth/profile
```

## Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contacts-db
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret  
GITHUB_CALLBACK_URL=https://your-domain.com/auth/github/callback
JWT_SECRET=your_very_long_and_random_production_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES=7
```

### GitHub OAuth App Settings:
Update your GitHub OAuth app with production URLs:
- Homepage URL: `https://your-domain.com`
- Callback URL: `https://your-domain.com/auth/github/callback`

## Troubleshooting

### If authentication still fails:
1. Check JWT secret is set in environment
2. Verify GitHub OAuth app settings
3. Check browser cookies are enabled
4. Look for JWT token in browser developer tools

### Debug logging:
The JWT system includes comprehensive logging to help identify issues.

## Migration Notes

- **No data loss**: User data remains in MongoDB
- **Backward compatible**: Same GitHub OAuth flow
- **API compatible**: Same endpoints and responses
- **More reliable**: Eliminates session persistence issues

This JWT-based system should resolve your session persistence problems and work reliably in production environments.