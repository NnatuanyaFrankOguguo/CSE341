import express from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthorById,
  deleteAuthorById,
  addAwardToAuthor
} from '../models/Author.js';

const router = express.Router();

// Middleware for logging requests
router.use((req, res, next) => {
  console.log(`👥 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// GET /authors - Get all authors with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    console.log('👥 Processing GET /authors request with query:', req.query);
    
    // Extract query parameters for filtering and pagination
    const { nationality, name, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    
    const filters = {};
    if (nationality) filters.nationality = nationality;
    if (name) filters.name = name;

    const options = {};
    if (sortBy) options.sortBy = sortBy;
    if (sortOrder) options.sortOrder = sortOrder;
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    options.skip = (pageNum - 1) * limitNum;
    options.limit = limitNum;

    const authors = await getAllAuthors(filters, options);
    
    console.log(`✅ Successfully returned ${authors.length} authors`);
    res.status(200).json({
      success: true,
      data: authors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: authors.length
      },
      filters: filters
    });
  } catch (error) {
    console.error('❌ Error in GET /authors:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /authors/:id - Get author by ID with their books
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👤 Processing GET /authors/${id}`);
    
    const author = await getAuthorById(id);
    
    console.log(`✅ Successfully returned author: ${author.name}`);
    res.status(200).json({
      success: true,
      data: author
    });
  } catch (error) {
    console.error(`❌ Error in GET /authors/${req.params.id}:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Author not found',
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

// POST /authors - Create new author
router.post('/', async (req, res) => {
  try {
    console.log('📝 Processing POST /authors with data:', JSON.stringify(req.body, null, 2));
    
    const authorData = req.body;
    
    // Log the creation attempt
    console.log(`📝 Attempting to create author: ${authorData.name || 'Unknown Name'}`);
    
    const newAuthor = await createAuthor(authorData);
    
    console.log(`✅ Successfully created author: ${newAuthor.name} (ID: ${newAuthor._id})`);
    res.status(201).json({
      success: true,
      data: newAuthor,
      message: 'Author created successfully'
    });
  } catch (error) {
    console.error('❌ Error in POST /authors:', error.message);
    
    if (error.message.includes('required') || 
        error.message.includes('Invalid') || 
        error.message.includes('already exists') ||
        error.message.includes('Validation failed')) {
      res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

// PUT /authors/:id - Update author by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`📝 Processing PUT /authors/${id} with data:`, JSON.stringify(updateData, null, 2));
    
    const updatedAuthor = await updateAuthorById(id, updateData);
    
    console.log(`✅ Successfully updated author: ${updatedAuthor.name}`);
    res.status(200).json({
      success: true,
      data: updatedAuthor,
      message: 'Author updated successfully'
    });
  } catch (error) {
    console.error(`❌ Error in PUT /authors/${req.params.id}:`, error.message);
    
    if (error.message.includes('Invalid') || 
        error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Author not found',
        message: error.message 
      });
    } else if (error.message.includes('already exists') ||
               error.message.includes('Validation failed')) {
      res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

// DELETE /authors/:id - Delete author by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Processing DELETE /authors/${id}`);
    
    const result = await deleteAuthorById(id);
    
    console.log(`✅ Successfully deleted author`);
    res.status(200).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error(`❌ Error in DELETE /authors/${req.params.id}:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Author not found',
        message: error.message 
      });
    } else if (error.message.includes('Cannot delete author')) {
      res.status(400).json({ 
        success: false,
        error: 'Cannot delete author with books',
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

// POST /authors/:id/awards - Add award to author
router.post('/:id/awards', async (req, res) => {
  try {
    const { id } = req.params;
    const { award } = req.body;
    
    console.log(`🏆 Processing POST /authors/${id}/awards with award: ${award}`);
    
    if (!award?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Award description is required'
      });
    }
    
    const updatedAuthor = await addAwardToAuthor(id, award);
    
    console.log(`✅ Successfully added award to author: ${updatedAuthor.name}`);
    res.status(200).json({
      success: true,
      data: updatedAuthor,
      message: 'Award added successfully'
    });
  } catch (error) {
    console.error(`❌ Error in POST /authors/${req.params.id}/awards:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Author not found',
        message: error.message 
      });
    } else if (error.message.includes('required')) {
      res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

export default router;