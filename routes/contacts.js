import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById
} from '../models/Contact.js';

const router = express.Router();

// GET /contacts - Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error in GET /contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /contacts/:id - Get contact by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    res.status(200).json(contact);
  } catch (error) {
    console.error(`Error in GET /contacts/${req.params.id}:`, error);
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /contacts - Create new contact
router.post('/', async (req, res) => {
  try {
    const contactData = req.body;
    const newContact = await createContact(contactData);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error in POST /contacts:', error);
    if (error.message.includes('required') || 
        error.message.includes('Invalid') || 
        error.message.includes('already exists')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT /contacts/:id - Update contact by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedContact = await updateContactById(id, updateData);
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error(`Error in PUT /contacts/${req.params.id}:`, error);
    if (error.message.includes('Invalid') || 
        error.message.includes('not found') ||
        error.message.includes('already exists')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE /contacts/:id - Delete contact by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteContactById(id);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error in DELETE /contacts/${req.params.id}:`, error);
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
