# 📚 Digital Library Management API

A comprehensive REST API for managing a digital library system built with modern Node.js, Express, and MongoDB. This system provides full CRUD operations for books and authors, **GitHub OAuth authentication**, advanced filtering, book borrowing/returning functionality, and professional-grade validation and security.

## 🌟 Features

### 🔐 Authentication & Security
- **GitHub OAuth Integration**: Secure authentication using GitHub accounts
- **Session Management**: Persistent sessions with secure cookie handling
- **Protected Endpoints**: Authentication required for write operations
- **Role-Based Access**: User and admin role management
- **Middleware Protection**: Authentication middleware for route protection

### Core Functionality

- **📖 Book Management**: Complete CRUD operations for books with 10+ fields
- **👥 Author Management**: Full author lifecycle management with 8+ fields  
- **🔄 Library Operations**: Book borrowing and returning system (protected)
- **🔍 Advanced Filtering**: Search and filter books by genre, author, availability
- **📄 Pagination**: Efficient data retrieval with pagination support
- **⭐ Rating System**: Book rating and review capabilities

### Technical Excellence

- **🛡️ Security First**: Helmet.js, rate limiting, CORS protection, OAuth
- **✅ Robust Validation**: Comprehensive input validation and sanitization
- **📝 Detailed Logging**: Request/response logging with performance tracking
- **🚀 Modern Architecture**: Clean MVC pattern with separation of concerns
- **📚 API Documentation**: Professional Swagger/OpenAPI documentation with auth
- **⚡ Performance Optimized**: MongoDB aggregation pipelines for efficiency

## 📊 Data Models

### 📖 Book Schema (10+ Fields)

- `title` (required): Book title
- `authorId` (required): Reference to author
- `isbn` (required): International Standard Book Number
- `genre` (required): Book category/genre
- `publishedDate` (required): Publication date
- `description` (required): Book summary
- `totalPages` (required): Number of pages
- `availability`: Current availability status
- `rating`: User rating (0-5)
- `borrowedBy`: Current borrower information
- `borrowedDate`: Date when borrowed
- `returnDueDate`: Due date for return
- `createdAt`/`updatedAt`: Timestamps

### 👤 Author Schema (8+ Fields)

- `name` (required): Author's full name
- `bio` (required): Author biography
- `birthDate` (required): Birth date
- `nationality` (required): Author's nationality
- `email`: Contact email
- `website`: Official website
- `socialMedia`: Social media handles (Twitter, Instagram, Facebook, LinkedIn)
- `awards`: Array of awards and achievements
- `isActive`: Active status
- `createdAt`/`updatedAt`: Timestamps

## � GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `Digital Library Management System`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click **"Register application"**
5. Copy the **Client ID** and **Client Secret**

### 2. Environment Variables Setup

Copy the `env.template` file to `.env` and fill in your values:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/digital-library

# Server Configuration
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-in-production

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

### 3. Generate Session Secret

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## �🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or Atlas)
- GitHub OAuth App (see setup above)
- npm or yarn package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/digital-library-api.git
   cd digital-library-api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.template .env
   # Edit .env with your MongoDB connection string and GitHub OAuth credentials
   ```

4. **Start the server:**

   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Seed the database (optional):**

   ```bash
   npm run seed
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/digital-library
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-library

# Server Configuration
PORT=3000
NODE_ENV=development

# Security (optional)
JWT_SECRET=your-secret-key-here
```

## 📖 API Documentation

### Base URLs

- **Local Development**: `http://localhost:3000`
- **Production**: Your deployed URL
- **API Documentation**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

### API Endpoints

#### � Authentication API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/github` | Login with GitHub OAuth | No |
| GET | `/auth/status` | Check authentication status | No |
| GET | `/auth/profile` | Get user profile | Yes |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/users` | Get all users (Admin only) | Yes (Admin) |

#### �📚 Books API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/books` | Get all books (with filtering & pagination) | No |
| GET | `/api/books/:id` | Get book by ID with author details | No |
| POST | `/api/books` | Create new book | **Yes** |
| PUT | `/api/books/:id` | Update book by ID | **Yes** |
| DELETE | `/api/books/:id` | Delete book by ID | **Yes** |
| POST | `/api/books/:id/borrow` | Borrow a book | **Yes** |
| POST | `/api/books/:id/return` | Return a book | **Yes** |

#### 👥 Authors API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/authors` | Get all authors (with filtering & pagination) | No |
| GET | `/api/authors/:id` | Get author by ID with their books | No |
| POST | `/api/authors` | Create new author | **Yes** |
| PUT | `/api/authors/:id` | Update author by ID | **Yes** |
| DELETE | `/api/authors/:id` | Delete author by ID | **Yes** |
| POST | `/api/authors/:id/awards` | Add award to author | **Yes** |

### Example API Calls

#### Create a New Author

```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Neil Gaiman",
    "bio": "English author of short fiction, novels, comic books, and graphic novels.",
    "birthDate": "1960-11-10",
    "nationality": "British",
    "email": "neil@neilgaiman.com",
    "website": "https://www.neilgaiman.com",
    "socialMedia": {
      "twitter": "@neilhimself",
      "instagram": "@neilhimself"
    },
    "awards": ["Hugo Award", "Nebula Award"]
  }'
```

#### Create a New Book

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "American Gods",
    "authorId": "AUTHOR_ID_HERE",
    "isbn": "9780060558123",
    "genre": "Fantasy",
    "publishedDate": "2001-06-19",
    "description": "A novel about the old gods brought to America and the new gods of modern life.",
    "totalPages": 635,
    "rating": 4.6
  }'
```

#### Get Books with Filtering

```bash
# Get fantasy books, sorted by title
curl "http://localhost:3000/api/books?genre=Fantasy&sortBy=title&sortOrder=asc&page=1&limit=10"

# Get available books only
curl "http://localhost:3000/api/books?availability=true"

# Get books by specific author
curl "http://localhost:3000/api/books?authorId=AUTHOR_ID_HERE"
```

#### Borrow a Book

```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID_HERE/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "borrowerInfo": "John Smith"
  }'
```

## 🛠️ Development

### Project Structure

```
digital-library-api/
├── db/
│   ├── connect.js          # MongoDB connection
│   └── seedData.js         # Sample data for seeding
├── models/
│   ├── Book.js             # Book model and operations
│   └── Author.js           # Author model and operations
├── routes/
│   ├── books.js            # Book routes
│   └── authors.js          # Author routes
├── server.js               # Express server setup
├── seed.js                 # Database seeding script
├── swagger.json            # API documentation
├── package.json
└── README.md
```

### Scripts

```bash
# Development
npm run dev         # Start with nodemon for auto-reload

# Production
npm start          # Start the server

# Database
npm run seed       # Seed the database with sample data

# Testing
npm test           # Run tests (to be implemented)
```

### Validation Rules

#### Book Validation

- `title`: Required, non-empty string
- `authorId`: Required, valid MongoDB ObjectId
- `isbn`: Required, valid ISBN format (10 or 13 digits)
- `genre`: Required, non-empty string
- `publishedDate`: Required, valid date (YYYY-MM-DD)
- `description`: Required, non-empty string
- `totalPages`: Required, integer between 1-10000
- `rating`: Optional, number between 0-5

#### Author Validation

- `name`: Required, non-empty string
- `bio`: Required, non-empty string
- `birthDate`: Required, valid date (YYYY-MM-DD), not in future
- `nationality`: Required, non-empty string
- `email`: Optional, valid email format, unique
- `website`: Optional, valid URL starting with http/https

## 🔒 Security Features

- **Helmet.js**: Security headers protection
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Secure error responses without sensitive data exposure

## 📊 Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Title is required",
  "timestamp": "2024-09-22T10:30:00.000Z"
}
```

## 🚀 Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
3. Deploy and your API will be available at your Render URL

### Environment Setup for Production

- Use MongoDB Atlas for cloud database
- Set appropriate CORS origins for your frontend
- Configure rate limiting for production traffic
- Enable logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **API Documentation**: Visit `/api-docs` for interactive documentation
- **Health Check**: Visit `/health` for system status
- **Issues**: Report bugs and request features via GitHub Issues

## 🎯 Project Goals

This Digital Library Management API was created as part of CSE341 coursework to demonstrate:

- ✅ Two MongoDB collections with proper relationships
- ✅ Collections with 7+ fields each (Books: 12+ fields, Authors: 10+ fields)
- ✅ Full CRUD operations with comprehensive validation
- ✅ Professional error handling and security measures
- ✅ Modern Node.js best practices and architecture
- ✅ Comprehensive API documentation
- ✅ Production-ready deployment configuration

---

**Made with ❤️ for CSE341 - Web Backend Development**