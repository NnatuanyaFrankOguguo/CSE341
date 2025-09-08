import { getDB } from './connect.js';

const sampleContacts = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@email.com",
    favoriteColor: "Purple",
    birthday: "1992-03-12",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@email.com", 
    favoriteColor: "Red",
    birthday: "1988-07-25",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Carol",
    lastName: "Davis",
    email: "carol.davis@email.com",
    favoriteColor: "Green",
    birthday: "1995-11-08",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@email.com",
    favoriteColor: "Blue",
    birthday: "1990-01-18",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Eva",
    lastName: "Brown",
    email: "eva.brown@email.com",
    favoriteColor: "Yellow",
    birthday: "1993-09-30",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const importSampleData = async () => {
  try {
    const db = getDB();
    const collection = db.collection('contacts');
    
    // Check if data already exists
    const existingCount = await collection.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} contacts. Skipping import.`);
      return;
    }
    
    // Insert sample data
    const result = await collection.insertMany(sampleContacts);
    console.log(`Successfully imported ${result.insertedCount} sample contacts`);
    
    // Display the imported contacts
    const importedContacts = await collection.find({}).toArray();
    console.log('\nImported contacts:');
    importedContacts.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.firstName} ${contact.lastName} (${contact.email}) - ID: ${contact._id}`);
    });
    
  } catch (error) {
    console.error('Error importing sample data:', error);
    throw error;
  }
};

export {
  importSampleData,
  sampleContacts
};
