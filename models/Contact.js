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

// Create new contact
const createContact = async (contactData) => {
  try {
    // Validate required fields
    const { firstName, lastName, email, favoriteColor, birthday } = contactData;
    
    if (!firstName || !lastName || !email) {
      throw new Error('firstName, lastName, and email are required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const db = getDB();
    
    // Check if email already exists
    const existingContact = await db.collection(COLLECTION_NAME).findOne({ email });
    if (existingContact) {
      throw new Error('Contact with this email already exists');
    }

    const newContact = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      favoriteColor: favoriteColor ? favoriteColor.trim() : '',
      birthday: birthday ? birthday.trim() : '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newContact);
    return { ...newContact, _id: result.insertedId };
  } catch (error) {
    throw new Error(`Error creating contact: ${error.message}`);
  }
};

// Update contact by ID
const updateContactById = async (id, updateData) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid contact ID format');
    }

    const { firstName, lastName, email, favoriteColor, birthday } = updateData;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
    }

    const db = getDB();
    
    // Check if email already exists (for other contacts)
    if (email) {
      const existingContact = await db.collection(COLLECTION_NAME).findOne({ 
        email: email.trim().toLowerCase(),
        _id: { $ne: new ObjectId(id) }
      });
      if (existingContact) {
        throw new Error('Another contact with this email already exists');
      }
    }

    const updateFields = {
      updatedAt: new Date()
    };

    if (firstName) updateFields.firstName = firstName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (favoriteColor !== undefined) updateFields.favoriteColor = favoriteColor.trim();
    if (birthday !== undefined) updateFields.birthday = birthday.trim();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error('Contact not found');
    }

    return await getContactById(id);
  } catch (error) {
    throw new Error(`Error updating contact: ${error.message}`);
  }
};

// Delete contact by ID
const deleteContactById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid contact ID format');
    }

    const db = getDB();
    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Contact not found');
    }

    return { message: 'Contact deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting contact: ${error.message}`);
  }
};

export {
  getAllContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById
};
