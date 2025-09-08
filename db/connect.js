import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

let client;
let db;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    // Get database name from URI or use default
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0] || 'contacts-db';
    db = client.db(dbName);
    
    console.log('Connected to MongoDB successfully');
    console.log(`Database: ${dbName}`);
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

export {
  connectDB,
  getDB,
  closeDB
};
