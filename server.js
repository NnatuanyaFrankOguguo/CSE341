import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { connectDB } from './db/connect.js';
import contactsRoutes from './routes/contacts.js';

// Load Swagger specification
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/contacts', contactsRoutes);

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contacts API is running!',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      'GET /contacts': 'Get all contacts',
      'GET /contacts/:id': 'Get contact by ID',
      'POST /contacts': 'Create new contact',
      'PUT /contacts/:id': 'Update contact by ID',
      'DELETE /contacts/:id': 'Delete contact by ID'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at: http://localhost:${PORT}`);
      console.log(`Swagger documentation available at: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
