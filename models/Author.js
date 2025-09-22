import { getDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'authors';

/**
 * Validates author data for creation and updates
 * @param {Object} authorData - The author data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with isValid flag and errors array
 */
const validateAuthorData = (authorData, isUpdate = false) => {
  console.log('📝 Validating author data:', JSON.stringify(authorData, null, 2));
  
  const errors = [];
  const { name, bio, birthDate, nationality, email, website } = authorData;

  // Required fields validation (only for creation)
  if (!isUpdate) {
    if (!name?.trim()) errors.push('Name is required');
    if (!bio?.trim()) errors.push('Bio is required');
    if (!birthDate?.trim()) errors.push('Birth date is required');
    if (!nationality?.trim()) errors.push('Nationality is required');
  }

  // Format validations
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    errors.push('Invalid birth date format (should be YYYY-MM-DD)');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (website && !website.startsWith('http')) {
    errors.push('Website must start with http:// or https://');
  }

  // Check if birth date is not in the future
  if (birthDate && new Date(birthDate) > new Date()) {
    errors.push('Birth date cannot be in the future');
  }

  console.log(`✅ Validation completed. Errors found: ${errors.length}`);
  return { isValid: errors.length === 0, errors };
};

/**
 * Get all authors with optional filtering and sorting
 * @param {Object} filters - Optional filters (nationality, name search)
 * @param {Object} options - Optional sorting and pagination
 * @returns {Array} Array of authors
 */
const getAllAuthors = async (filters = {}, options = {}) => {
  try {
    console.log('👥 Fetching all authors with filters:', JSON.stringify(filters, null, 2));
    
    const db = getDB();
    let query = {};

    // Apply filters
    if (filters.nationality) {
      query.nationality = new RegExp(filters.nationality, 'i');
    }
    if (filters.name) {
      query.name = new RegExp(filters.name, 'i');
    }

    // Build aggregation pipeline for book count lookup
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'authorId',
          as: 'books'
        }
      },
      {
        $addFields: {
          bookCount: { $size: '$books' },
          bookTitles: '$books.title'
        }
      },
      {
        $project: {
          books: 0 // Remove the full books array from output for cleaner response
        }
      }
    ];

    // Apply sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      pipeline.push({ $sort: { [options.sortBy]: sortOrder } });
    } else {
      pipeline.push({ $sort: { name: 1 } });
    }

    // Apply pagination
    if (options.skip) pipeline.push({ $skip: parseInt(options.skip) });
    if (options.limit) pipeline.push({ $limit: parseInt(options.limit) });

    const authors = await db.collection(COLLECTION_NAME).aggregate(pipeline).toArray();
    
    console.log(`✅ Successfully fetched ${authors.length} authors`);
    return authors;
  } catch (error) {
    console.error('❌ Error fetching authors:', error.message);
    throw new Error(`Error fetching authors: ${error.message}`);
  }
};

/**
 * Get author by ID with their books
 * @param {string} id - Author ID
 * @returns {Object} Author object with books
 */
const getAuthorById = async (id) => {
  try {
    console.log(`👤 Fetching author by ID: ${id}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid author ID format');
    }

    const db = getDB();
    
    // Use aggregation to include books
    const authors = await db.collection(COLLECTION_NAME).aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'authorId',
          as: 'books'
        }
      },
      {
        $addFields: {
          bookCount: { $size: '$books' }
        }
      }
    ]).toArray();
    
    if (authors.length === 0) {
      throw new Error('Author not found');
    }
    
    console.log(`✅ Successfully fetched author: ${authors[0].name}`);
    return authors[0];
  } catch (error) {
    console.error('❌ Error fetching author:', error.message);
    throw new Error(`Error fetching author: ${error.message}`);
  }
};

/**
 * Create new author with comprehensive validation
 * @param {Object} authorData - Author data object
 * @returns {Object} Created author object
 */
const createAuthor = async (authorData) => {
  try {
    console.log('📝 Creating new author:', JSON.stringify(authorData, null, 2));
    
    // Validate required fields and format
    const validation = validateAuthorData(authorData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const { 
      name, 
      bio, 
      birthDate, 
      nationality, 
      email, 
      website, 
      socialMedia = {},
      awards = [] 
    } = authorData;

    const db = getDB();
    
    // Check if email already exists (if provided)
    if (email) {
      const existingAuthor = await db.collection(COLLECTION_NAME).findOne({ 
        email: email.trim().toLowerCase() 
      });
      if (existingAuthor) {
        throw new Error('Author with this email already exists');
      }
    }

    const newAuthor = {
      name: name.trim(),
      bio: bio.trim(),
      birthDate: birthDate.trim(),
      nationality: nationality.trim(),
      email: email ? email.trim().toLowerCase() : null,
      website: website ? website.trim() : null,
      socialMedia: {
        twitter: socialMedia.twitter ? socialMedia.twitter.trim() : null,
        instagram: socialMedia.instagram ? socialMedia.instagram.trim() : null,
        facebook: socialMedia.facebook ? socialMedia.facebook.trim() : null,
        linkedin: socialMedia.linkedin ? socialMedia.linkedin.trim() : null
      },
      awards: Array.isArray(awards) ? awards.map(award => award.trim()) : [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newAuthor);
    const createdAuthor = { ...newAuthor, _id: result.insertedId };
    
    console.log(`✅ Successfully created author: ${createdAuthor.name} (ID: ${createdAuthor._id})`);
    return createdAuthor;
  } catch (error) {
    console.error('❌ Error creating author:', error.message);
    throw new Error(`Error creating author: ${error.message}`);
  }
};

/**
 * Update author by ID with validation
 * @param {string} id - Author ID
 * @param {Object} updateData - Update data object
 * @returns {Object} Updated author object
 */
const updateAuthorById = async (id, updateData) => {
  try {
    console.log(`📝 Updating author ID: ${id}`, JSON.stringify(updateData, null, 2));
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid author ID format');
    }

    // Validate update data
    const validation = validateAuthorData(updateData, true);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const db = getDB();
    
    // Check if email already exists (for other authors)
    if (updateData.email) {
      const existingAuthor = await db.collection(COLLECTION_NAME).findOne({ 
        email: updateData.email.trim().toLowerCase(),
        _id: { $ne: new ObjectId(id) }
      });
      if (existingAuthor) {
        throw new Error('Another author with this email already exists');
      }
    }

    const updateFields = {
      updatedAt: new Date()
    };

    // Build update fields dynamically
    if (updateData.name) updateFields.name = updateData.name.trim();
    if (updateData.bio) updateFields.bio = updateData.bio.trim();
    if (updateData.birthDate) updateFields.birthDate = updateData.birthDate.trim();
    if (updateData.nationality) updateFields.nationality = updateData.nationality.trim();
    if (updateData.email) updateFields.email = updateData.email.trim().toLowerCase();
    if (updateData.website !== undefined) updateFields.website = updateData.website ? updateData.website.trim() : null;
    if (updateData.isActive !== undefined) updateFields.isActive = Boolean(updateData.isActive);
    
    // Handle social media updates
    if (updateData.socialMedia) {
      updateFields.socialMedia = {
        twitter: updateData.socialMedia.twitter ? updateData.socialMedia.twitter.trim() : null,
        instagram: updateData.socialMedia.instagram ? updateData.socialMedia.instagram.trim() : null,
        facebook: updateData.socialMedia.facebook ? updateData.socialMedia.facebook.trim() : null,
        linkedin: updateData.socialMedia.linkedin ? updateData.socialMedia.linkedin.trim() : null
      };
    }
    
    // Handle awards updates
    if (updateData.awards) {
      updateFields.awards = Array.isArray(updateData.awards) 
        ? updateData.awards.map(award => award.trim()) 
        : [];
    }

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error('Author not found');
    }

    const updatedAuthor = await getAuthorById(id);
    console.log(`✅ Successfully updated author: ${updatedAuthor.name}`);
    return updatedAuthor;
  } catch (error) {
    console.error('❌ Error updating author:', error.message);
    throw new Error(`Error updating author: ${error.message}`);
  }
};

/**
 * Delete author by ID with safety checks
 * @param {string} id - Author ID
 * @returns {Object} Success message
 */
const deleteAuthorById = async (id) => {
  try {
    console.log(`🗑️ Deleting author ID: ${id}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid author ID format');
    }

    const db = getDB();
    
    // Check if author has books
    const author = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    if (!author) {
      throw new Error('Author not found');
    }
    
    const booksCount = await db.collection('books').countDocuments({ authorId: new ObjectId(id) });
    if (booksCount > 0) {
      throw new Error(`Cannot delete author who has ${booksCount} book(s) in the system. Please remove or reassign the books first.`);
    }

    const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Author not found');
    }

    console.log(`✅ Successfully deleted author: ${author.name}`);
    return { message: 'Author deleted successfully', deletedAuthor: author.name };
  } catch (error) {
    console.error('❌ Error deleting author:', error.message);
    throw new Error(`Error deleting author: ${error.message}`);
  }
};

/**
 * Add an award to an author
 * @param {string} id - Author ID
 * @param {string} award - Award to add
 * @returns {Object} Updated author object
 */
const addAwardToAuthor = async (id, award) => {
  try {
    console.log(`🏆 Adding award to author ID: ${id}, Award: ${award}`);
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid author ID format');
    }

    if (!award?.trim()) {
      throw new Error('Award description is required');
    }

    const db = getDB();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { 
        $addToSet: { awards: award.trim() },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Author not found');
    }

    console.log(`✅ Successfully added award to author`);
    return await getAuthorById(id);
  } catch (error) {
    console.error('❌ Error adding award to author:', error.message);
    throw new Error(`Error adding award to author: ${error.message}`);
  }
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthorById,
  deleteAuthorById,
  addAwardToAuthor
};