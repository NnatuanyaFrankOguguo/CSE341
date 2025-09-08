# Contacts API

A REST API for managing contacts built with Node.js, Express, and MongoDB.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete contacts
- **MongoDB Integration**: Stores contact data in MongoDB
- **Input Validation**: Validates required fields and email format
- **Error Handling**: Comprehensive error handling and responses
- **MVC Architecture**: Organized code structure with separation of concerns

## Contact Data Structure

Each contact contains:
- `firstName` (required): Contact's first name
- `lastName` (required): Contact's last name  
- `email` (required): Contact's email address (must be unique)
- `favoriteColor` (optional): Contact's favorite color
- `birthday` (optional): Contact's birthday

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd contacts-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env file with your MongoDB connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contacts-db
   PORT=3000
   ```

4. Import sample data (optional):
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Base URL
- Local: `http://localhost:3000`
- Production: Your deployed URL

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/contacts` | Get all contacts |
| GET | `/contacts/:id` | Get contact by ID |
| POST | `/contacts` | Create new contact |
| PUT | `/contacts/:id` | Update contact by ID |
| DELETE | `/contacts/:id` | Delete contact by ID |

### Example Requests

#### Get All Contacts
```http
GET /contacts
```

#### Get Contact by ID
```http
GET /contacts/60f1b2b3b3b3b3b3b3b3b3b3
```

#### Create New Contact
```http
POST /contacts
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "favoriteColor": "Blue",
  "birthday": "1990-05-15"
}
```

#### Update Contact
```http
PUT /contacts/60f1b2b3b3b3b3b3b3b3b3b3
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.updated@example.com",
  "favoriteColor": "Red"
}
```

#### Delete Contact
```http
DELETE /contacts/60f1b2b3b3b3b3b3b3b3b3b3
```

## Testing

Use the included `contacts.rest` file with the REST Client extension in VS Code to test all endpoints.

## Project Structure

```
contacts-api/
├── db/
│   ├── connect.js      # Database connection
│   └── seedData.js     # Sample data for testing
├── models/
│   └── Contact.js      # Contact model with database operations
├── routes/
│   └── contacts.js     # API route definitions
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore file
├── contacts.rest      # REST client test file
├── package.json       # Project dependencies
├── seed.js           # Script to import sample data
└── server.js         # Main server file
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive message:
```json
{
  "error": "Contact with this email already exists"
}
```

## Deployment to Render

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Set environment variables in Render dashboard
4. Deploy the application

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-restart
- `npm run seed` - Import sample data to database

### Adding New Features

1. Follow MVC architecture
2. Add new routes in `routes/` directory
3. Add business logic in `models/` directory
4. Update tests in `contacts.rest` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
