import { getDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'books';

/**
 * Validates book data for creation and updates
 * @param {Object} bookData - The book data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with isValid flag and errors array
 */
const validateBookData = (bookData, isUpdate = false) => {
  console.log('📝 Validating book data:', JSON.stringify(bookData, null, 2));
  
  const errors = [];
  const { title, authorId, isbn, genre, publishedDate, description, totalPages, rating } = bookData;

  // Required fields validation (only for creation)
  if (!isUpdate) {
    if (!title?.trim()) errors.push('Title is required');
    if (!authorId?.trim()) errors.push('Author ID is required');
    if (!isbn?.trim()) errors.push('ISBN is required');
    if (!genre?.trim()) errors.push('Genre is required');
    if (!publishedDate?.trim()) errors.push('Published date is required');
    if (!description?.trim()) errors.push('Description is required');
    if (totalPages === undefined || totalPages === null) errors.push('Total pages is required');
  }

  // Format validations
  if (isbn && !/^[\d-]{10,17}$/.test(isbn.replace(/[-\s]/g, ''))) {
    errors.push('Invalid ISBN format (should be 10 or 13 digits)');
  }

  if (publishedDate && !/^\d{4}-\d{2}-\d{2}$/.test(publishedDate)) {
    errors.push('Invalid date format (should be YYYY-MM-DD)');
  }

  if (totalPages !== undefined && (totalPages < 1 || totalPages > 10000)) {
    errors.push('Total pages must be between 1 and 10000');
  }

  if (rating !== undefined && (rating < 0 || rating > 5)) {
    errors.push('Rating must be between 0 and 5');
  }

  if (authorId && !ObjectId.isValid(authorId)) {
    errors.push('Invalid author ID format');
  }

  console.log(`✅ Validation completed. Errors found: ${errors.length}`);
  return { isValid: errors.length === 0, errors };
};

/**
 * Get all books with optional filtering and sorting
 * @param {Object} filters - Optional filters (genre, author, availability)
 * @param {Object} options - Optional sorting and pagination
 * @returns {Array} Array of books
 */
const getAllBooks = async (filters = {}, options = {}) => {
  try {
    console.log('📚 Fetching all books with filters:', JSON.stringify(filters, null, 2));
    
    const db = getDB();
    let query = {};

    // Apply filters
    if (filters.genre) query.genre = new RegExp(filters.genre, 'i');
    if (filters.authorId && ObjectId.isValid(filters.authorId)) {
      query.authorId = new ObjectId(filters.authorId);
    }
    if (filters.availability !== undefined) query.availability = filters.availability;

    // Build aggregation pipeline for author lookup
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ];

    // Apply sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      pipeline.push({ $sort: { [options.sortBy]: sortOrder } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Apply pagination
    if (options.skip) pipeline.push({ $skip: parseInt(options.skip) });
    if (options.limit) pipeline.push({ $limit: parseInt(options.limit) });

    const books = await db.collection(COLLECTION_NAME).aggregate(pipeline).toArray();
    
    console.log(`✅ Successfully fetched ${books.length} books`);
    return books;
  } catch (error) {
    console.error('❌ Error fetching books:', error.message);
    throw new Error(`Error fetching books: ${error.message}`);
  }
};

/**
 * Get book by ID with author details
 * @param {string} id - Book ID
 * @returns {Object} Book object with author details
 */
const getBookById = async (id) => {
  try {
    console.log(`📖 Fetching book by ID: ${id}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid book ID format');
    }

    const db = getDB();
    
    // Use aggregation to include author details
    const books = await db.collection(COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ]).toArray();
    
    if (books.length === 0) {
      throw new Error('Book not found');
    }
    
    console.log(`✅ Successfully fetched book: ${books[0].title}`);
    return books[0];
  } catch (error) {
    console.error('❌ Error fetching book:', error.message);
    throw new Error(`Error fetching book: ${error.message}`);
  }
};

/**
 * Create new book with comprehensive validation
 * @param {Object} bookData - Book data object
 * @returns {Object} Created book object
 */
const createBook = async (bookData) => {
  try {
    console.log('📝 Creating new book:', JSON.stringify(bookData, null, 2));
    
    // Validate required fields and format
    const validation = validateBookData(bookData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const { title, authorId, isbn, genre, publishedDate, description, totalPages, rating, availability = true } = bookData;

    const db = getDB();
    
    // Check if ISBN already exists
    const existingBook = await db.collection(COLLECTION_NAME).findOne({ isbn: isbn.trim() });
    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }

    // Verify author exists
    const authorExists = await db.collection('authors').findOne({ _id: new ObjectId(authorId) });
    if (!authorExists) {
      throw new Error('Author not found');
    }

    const newBook = {
      title: title.trim(),
      authorId: new ObjectId(authorId),
      isbn: isbn.trim().replace(/[-\s]/g, ''), // Store ISBN without formatting
      genre: genre.trim(),
      publishedDate: publishedDate.trim(),
      description: description.trim(),
      totalPages: parseInt(totalPages),
      availability: Boolean(availability),
      rating: rating ? parseFloat(rating) : 0,
      borrowedBy: null,
      borrowedDate: null,
      returnDueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newBook);
    const createdBook = { ...newBook, _id: result.insertedId };
    
    console.log(`✅ Successfully created book: ${createdBook.title} (ID: ${createdBook._id})`);
    return createdBook;
  } catch (error) {
    console.error('❌ Error creating book:', error.message);
    throw new Error(`Error creating book: ${error.message}`);
  }
};

/**
 * Update book by ID with validation
 * @param {string} id - Book ID
 * @param {Object} updateData - Update data object
 * @returns {Object} Updated book object
 */
const updateBookById = async (id, updateData) => {
  try {
    console.log(`📝 Updating book ID: ${id}`, JSON.stringify(updateData, null, 2));
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid book ID format');
    }

    // Validate update data
    const validation = validateBookData(updateData, true);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const db = getDB();
    
    // Check if ISBN already exists (for other books)
    if (updateData.isbn) {
      const existingBook = await db.collection(COLLECTION_NAME).findOne({ 
        isbn: updateData.isbn.trim().replace(/[-\s]/g, ''),
        _id: { $ne: new ObjectId(id) }
      });
      if (existingBook) {
        throw new Error('Another book with this ISBN already exists');
      }
    }

    // Verify author exists if authorId is being updated
    if (updateData.authorId && ObjectId.isValid(updateData.authorId)) {
      const authorExists = await db.collection('authors').findOne({ _id: new ObjectId(updateData.authorId) });
      if (!authorExists) {
        throw new Error('Author not found');
      }
    }

    const updateFields = {
      updatedAt: new Date()
    };

    // Build update fields dynamically
    if (updateData.title) updateFields.title = updateData.title.trim();
    if (updateData.authorId) updateFields.authorId = new ObjectId(updateData.authorId);
    if (updateData.isbn) updateFields.isbn = updateData.isbn.trim().replace(/[-\s]/g, '');
    if (updateData.genre) updateFields.genre = updateData.genre.trim();
    if (updateData.publishedDate) updateFields.publishedDate = updateData.publishedDate.trim();
    if (updateData.description) updateFields.description = updateData.description.trim();
    if (updateData.totalPages) updateFields.totalPages = parseInt(updateData.totalPages);
    if (updateData.rating !== undefined) updateFields.rating = parseFloat(updateData.rating);
    if (updateData.availability !== undefined) updateFields.availability = Boolean(updateData.availability);

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error('Book not found');
    }

    const updatedBook = await getBookById(id);
    console.log(`✅ Successfully updated book: ${updatedBook.title}`);
    return updatedBook;
  } catch (error) {
    console.error('❌ Error updating book:', error.message);
    throw new Error(`Error updating book: ${error.message}`);
  }
};

/**
 * Delete book by ID with safety checks
 * @param {string} id - Book ID
 * @returns {Object} Success message
 */
const deleteBookById = async (id) => {
  try {
    console.log(`🗑️ Deleting book ID: ${id}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid book ID format');
    }

    const db = getDB();
    
    // Check if book is currently borrowed
    const book = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    if (!book) {
      throw new Error('Book not found');
    }
    
    if (book.borrowedBy) {
      throw new Error('Cannot delete book that is currently borrowed');
    }

    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Book not found');
    }

    console.log(`✅ Successfully deleted book: ${book.title}`);
    return { message: 'Book deleted successfully', deletedBook: book.title };
  } catch (error) {
    console.error('❌ Error deleting book:', error.message);
    throw new Error(`Error deleting book: ${error.message}`);
  }
};

/**
 * Borrow a book (update availability)
 * @param {string} id - Book ID
 * @param {string} borrowerInfo - Borrower information
 * @returns {Object} Updated book object
 */
const borrowBook = async (id, borrowerInfo) => {
  try {
    console.log(`📚 Borrowing book ID: ${id} by: ${borrowerInfo}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid book ID format');
    }

    const db = getDB();
    const book = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    
    if (!book) {
      throw new Error('Book not found');
    }
    
    if (!book.availability) {
      throw new Error('Book is not available for borrowing');
    }

    const borrowDate = new Date();
    const returnDueDate = new Date();
    returnDueDate.setDate(returnDueDate.getDate() + 14); // 14 days from now

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          availability: false,
          borrowedBy: borrowerInfo.trim(),
          borrowedDate: borrowDate,
          returnDueDate: returnDueDate,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Book not found');
    }

    console.log(`✅ Successfully borrowed book: ${book.title}`);
    return await getBookById(id);
  } catch (error) {
    console.error('❌ Error borrowing book:', error.message);
    throw new Error(`Error borrowing book: ${error.message}`);
  }
};

/**
 * Return a book (update availability)
 * @param {string} id - Book ID
 * @returns {Object} Updated book object
 */
const returnBook = async (id) => {
  try {
    console.log(`📚 Returning book ID: ${id}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid book ID format');
    }

    const db = getDB();
    const book = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    
    if (!book) {
      throw new Error('Book not found');
    }
    
    if (book.availability) {
      throw new Error('Book is not currently borrowed');
    }

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          availability: true,
          updatedAt: new Date()
        },
        $unset: {
          borrowedBy: "",
          borrowedDate: "",
          returnDueDate: ""
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Book not found');
    }

    console.log(`✅ Successfully returned book: ${book.title}`);
    return await getBookById(id);
  } catch (error) {
    console.error('❌ Error returning book:', error.message);
    throw new Error(`Error returning book: ${error.message}`);
  }
};

export {
  getAllBooks,
  getBookById,
  createBook,
  updateBookById,
  deleteBookById,
  borrowBook,
  returnBook
};
