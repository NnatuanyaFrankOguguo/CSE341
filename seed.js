import dotenv from 'dotenv';
import { connectDB, closeDB } from './db/connect.js';
import { importSampleData } from './db/seedData.js';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Importing sample data...');
    await importSampleData();
    
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

runSeed();
