import swaggerAutoGen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Digital Library Management API',
    description: 'A comprehensive library management system with books, authors, and GitHub OAuth authentication',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
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
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'The Great Gatsby'
        },
        author: {
          type: 'string',
          example: 'F. Scott Fitzgerald'
        },
        isbn: {
          type: 'string',
          example: '978-0-7432-7356-5'
        },
        genre: {
          type: 'string',
          example: 'Fiction'
        },
        publishedYear: {
          type: 'number',
          example: 1925
        },
        publisher: {
          type: 'string',
          example: 'Charles Scribner\'s Sons'
        },
        pages: {
          type: 'number',
          example: 180
        },
        language: {
          type: 'string',
          example: 'English'
        },
        availability: {
          type: 'boolean',
          example: true
        },
        description: {
          type: 'string',
          example: 'A classic American novel'
        }
      }
    },
    Author: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'F. Scott Fitzgerald'
        },
        birthDate: {
          type: 'string',
          example: '1896-09-24'
        },
        nationality: {
          type: 'string',
          example: 'American'
        },
        biography: {
          type: 'string',
          example: 'American novelist and short story writer'
        },
        genres: {
          type: 'array',
          items: {
            type: 'string'
          },
          example: ['Fiction', 'Modernist literature']
        },
        website: {
          type: 'string',
          example: 'https://example.com'
        },
        email: {
          type: 'string',
          example: 'author@example.com'
        }
      }
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
  './server.js',
  './routes/auth.js',
  './routes/books.js',
  './routes/authors.js'
];

swaggerAutoGen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully for Digital Library API.');
});