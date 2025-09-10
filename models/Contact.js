import { getDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'contacts';

// Get all contacts
const getAllContacts = async () => {
  try {
    const db = getDB();
    const contacts = await db.collection(COLLECTION_NAME).find({}).toArray();
    return contacts;
  } catch (error) {
    throw new Error(`Error fetching contacts: ${error.message}`);
  }
};

// Get contact by ID
const getContactById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid contact ID format');
    }

    const db = getDB();
    const contact = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    return contact;
  } catch (error) {
    throw new Error(`Error fetching contact: ${error.message}`);
  }
};


export {
  getAllContacts,
  getContactById,
};
