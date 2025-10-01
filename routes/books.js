import express from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
  borrowBook,
  returnBook
} from '../models/Book.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware for logging requests
router.use((req, res, next) => {
  console.log(`📚 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get all books
 *     description: Get all books with optional filtering and pagination
 *     parameters:
 *       - name: genre
 *         in: query
 *         type: string
 *         description: Filter by genre
 *       - name: authorId
 *         in: query
 *         type: string
 *         description: Filter by author ID
 *       - name: availability
 *         in: query
 *         type: boolean
 *         description: Filter by availability
 *       - name: page
 *         in: query
 *         type: integer
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved books
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Book'
 */
router.get('/', async (req, res) => {
  try {
    console.log('📚 Processing GET /books request with query:', req.query);
    
    // Extract query parameters for filtering and pagination
    const { genre, authorId, availability, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    
    const filters = {};
    if (genre) filters.genre = genre;
    if (authorId) filters.authorId = authorId;
    if (availability !== undefined) filters.availability = availability === 'true';

    const options = {};
    if (sortBy) options.sortBy = sortBy;
    if (sortOrder) options.sortOrder = sortOrder;
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    options.skip = (pageNum - 1) * limitNum;
    options.limit = limitNum;

    const books = await getAllBooks(filters, options);
    
    console.log(`✅ Successfully returned ${books.length} books`);
    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: books.length
      },
      filters: filters
    });
  } catch (error) {
    console.error('❌ Error in GET /books:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /books/:id - Get book by ID with author details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📖 Processing GET /books/${id}`);
    
    const book = await getBookById(id);
    
    console.log(`✅ Successfully returned book: ${book.title}`);
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(`❌ Error in GET /books/${req.params.id}:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Book not found',
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

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags:
 *       - Books
 *     summary: Create new book (Protected)
 *     description: Create a new book - requires authentication
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: book
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             data:
 *               $ref: '#/definitions/Book'
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Validation error
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('📝 Processing POST /books with data:', JSON.stringify(req.body, null, 2));
    
    const bookData = req.body;
    
    // Log the creation attempt
    console.log(`📝 Attempting to create book: ${bookData.title || 'Unknown Title'}`);
    
    const newBook = await createBook(bookData);
    
    console.log(`✅ Successfully created book: ${newBook.title} (ID: ${newBook._id})`);
    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Book created successfully'
    });
  } catch (error) {
    console.error('❌ Error in POST /books:', error.message);
    
    if (error.message.includes('required') || 
        error.message.includes('Invalid') || 
        error.message.includes('already exists') ||
        error.message.includes('Validation failed')) {
      res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: error.message 
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Referenced resource not found',
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

// PUT /books/:id - Update book by ID (Protected)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`📝 Processing PUT /books/${id} with data:`, JSON.stringify(updateData, null, 2));
    
    const updatedBook = await updateBookById(id, updateData);
    
    console.log(`✅ Successfully updated book: ${updatedBook.title}`);
    res.status(200).json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error(`❌ Error in PUT /books/${req.params.id}:`, error.message);
    
    if (error.message.includes('Invalid') || 
        error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Book not found',
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

// DELETE /books/:id - Delete book by ID (Protected)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Processing DELETE /books/${id}`);
    
    const result = await deleteBookById(id);
    
    console.log(`✅ Successfully deleted book`);
    res.status(200).json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error(`❌ Error in DELETE /books/${req.params.id}:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Book not found',
        message: error.message 
      });
    } else if (error.message.includes('borrowed')) {
      res.status(400).json({ 
        success: false,
        error: 'Cannot delete borrowed book',
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

// POST /books/:id/borrow - Borrow a book (Protected)
router.post('/:id/borrow', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { borrowerInfo } = req.body;
    
    console.log(`📚 Processing POST /books/${id}/borrow for: ${borrowerInfo}`);
    
    if (!borrowerInfo?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Borrower information is required'
      });
    }
    
    const borrowedBook = await borrowBook(id, borrowerInfo);
    
    console.log(`✅ Successfully borrowed book: ${borrowedBook.title}`);
    res.status(200).json({
      success: true,
      data: borrowedBook,
      message: 'Book borrowed successfully'
    });
  } catch (error) {
    console.error(`❌ Error in POST /books/${req.params.id}/borrow:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Book not found',
        message: error.message 
      });
    } else if (error.message.includes('not available')) {
      res.status(400).json({ 
        success: false,
        error: 'Book not available',
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

// POST /books/:id/return - Return a book (Protected)
router.post('/:id/return', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📚 Processing POST /books/${id}/return`);
    
    const returnedBook = await returnBook(id);
    
    console.log(`✅ Successfully returned book: ${returnedBook.title}`);
    res.status(200).json({
      success: true,
      data: returnedBook,
      message: 'Book returned successfully'
    });
  } catch (error) {
    console.error(`❌ Error in POST /books/${req.params.id}/return:`, error.message);
    
    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Book not found',
        message: error.message 
      });
    } else if (error.message.includes('not currently borrowed')) {
      res.status(400).json({ 
        success: false,
        error: 'Book not borrowed',
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
