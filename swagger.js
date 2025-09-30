import swaggerAutoGen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Digital Library Management API',
    description: 'A comprehensive library management system with books, authors, and GitHub OAuth authentication',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    sessionAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
      description: 'Session-based authentication using GitHub OAuth'
    }
  },
  definitions: {
    Book: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      genre: 'Fiction',
      publishedYear: 1925,
      publisher: 'Charles Scribner\'s Sons',
      pages: 180,
      language: 'English',
      availability: true,
      description: 'A classic American novel'
    },
    Author: {
      name: 'F. Scott Fitzgerald',
      birthDate: '1896-09-24',
      nationality: 'American',
      biography: 'American novelist and short story writer',
      genres: ['Fiction', 'Modernist literature'],
      website: 'https://example.com',
      email: 'author@example.com',
      socialMedia: {
        twitter: '@author',
        instagram: '@author'
      }
    },
    User: {
      displayName: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      role: 'user',
      avatarUrl: 'https://github.com/johndoe.png'
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'GitHub OAuth authentication endpoints'
    },
    {
      name: 'Books',
      description: 'Book management operations'
    },
    {
      name: 'Authors',
      description: 'Author management operations'
    }
  ]
};

const outputFile = './swagger.json';
const endpointsFiles = [
  './routes/auth.js',
  './routes/books.js',
  './routes/authors.js',
  './server.js'
];

swaggerAutoGen(outputFile, doc, endpointsFiles).then(() => {
  console.log('Swagger documentation generated successfully for Digital Library API.');
});