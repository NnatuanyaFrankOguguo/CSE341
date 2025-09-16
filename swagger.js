import swaggerAutoGen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Contacts API',
    description: 'API for managing contacts',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger.json'; // where to write swagger doc
const endpointsFiles = ['./routes/contacts.js', './server.js', ]; // your main file with routes

swaggerAutoGen(outputFile, doc, endpointsFiles).then(() => {
  console.log('Swagger documentation generated successfully.');
});