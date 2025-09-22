import { getDB } from './connect.js';
import { ObjectId } from 'mongodb';

// Sample authors data with 8+ fields each
const sampleAuthors = [
  {
    _id: new ObjectId(),
    name: "J.K. Rowling",
    bio: "British author, philanthropist, film producer, television producer, and screenwriter. She is best known for writing the Harry Potter fantasy series, which has won multiple awards and sold more than 500 million copies worldwide.",
    birthDate: "1965-07-31",
    nationality: "British",
    email: "jk.rowling@bloomsbury.com",
    website: "https://www.jkrowling.com",
    socialMedia: {
      twitter: "@jk_rowling",
      instagram: null,
      facebook: "JKRowlingOfficial", 
      linkedin: null
    },
    awards: ["Order of the British Empire", "Hans Christian Andersen Literature Award", "Prince of Asturias Award"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "George R.R. Martin",
    bio: "American novelist and short story writer, screenwriter, and television producer. He is the author of the series of epic fantasy novels A Song of Ice and Fire, which was adapted into the Emmy Award-winning HBO series Game of Thrones.",
    birthDate: "1948-09-20",
    nationality: "American",
    email: "grrm@georgerrmartin.com",
    website: "https://georgerrmartin.com",
    socialMedia: {
      twitter: null,
      instagram: null,
      facebook: "GeorgeRRMartinOfficial",
      linkedin: null
    },
    awards: ["Hugo Award", "Nebula Award", "World Fantasy Award", "Locus Award"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Agatha Christie",
    bio: "English writer known for her sixty-six detective novels and fourteen short story collections, particularly those revolving around fictional detectives Hercule Poirot and Miss Jane Marple.",
    birthDate: "1890-09-15",
    nationality: "British",
    email: null,
    website: "https://www.agathachristie.com",
    socialMedia: {
      twitter: "@agathachristie",
      instagram: null,
      facebook: "OfficialAgathaChristie",
      linkedin: null
    },
    awards: ["Grand Master Award", "Commander of the Order of the British Empire"],
    isActive: false, // Deceased author
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Stephen King",
    bio: "American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. He has published 64 novels and 200 short stories, most of which have been adapted for film, television, and video games.",
    birthDate: "1947-09-21",
    nationality: "American",
    email: "contact@stephenking.com",
    website: "https://stephenking.com",
    socialMedia: {
      twitter: "@StephenKing",
      instagram: null,
      facebook: "OfficialStephenKing",
      linkedin: null
    },
    awards: ["National Medal of Arts", "World Fantasy Award", "Bram Stoker Award"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Toni Morrison",
    bio: "American novelist, essayist, book editor, and college professor. Her first novel, The Bluest Eye, was published in 1970. She won the Nobel Prize in Literature in 1993.",
    birthDate: "1931-02-18",
    nationality: "American",
    email: null,
    website: null,
    socialMedia: {
      twitter: null,
      instagram: null,
      facebook: null,
      linkedin: null
    },
    awards: ["Nobel Prize in Literature", "Pulitzer Prize for Fiction", "Presidential Medal of Freedom"],
    isActive: false, // Deceased author
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample books data with 10+ fields each - referencing the author IDs above
const sampleBooks = [
  {
    title: "Harry Potter and the Philosopher's Stone",
    authorId: sampleAuthors[0]._id, // J.K. Rowling
    isbn: "9780747532699",
    genre: "Fantasy",
    publishedDate: "1997-06-26",
    description: "The first novel in the Harry Potter series and Rowling's debut novel, it follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.",
    totalPages: 223,
    availability: true,
    rating: 4.8,
    borrowedBy: null,
    borrowedDate: null,
    returnDueDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "A Game of Thrones",
    authorId: sampleAuthors[1]._id, // George R.R. Martin
    isbn: "9780553103540",
    genre: "Epic Fantasy",
    publishedDate: "1996-08-01",
    description: "The first novel in A Song of Ice and Fire series. Set in the fictional Seven Kingdoms of Westeros, the novel follows a web of political conflicts among the realm's noble families.",
    totalPages: 694,
    availability: false,
    rating: 4.7,
    borrowedBy: "John Smith",
    borrowedDate: new Date('2024-09-10'),
    returnDueDate: new Date('2024-09-24'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Murder on the Orient Express",
    authorId: sampleAuthors[2]._id, // Agatha Christie
    isbn: "9780062693662",
    genre: "Mystery",
    publishedDate: "1934-01-01",
    description: "A work of detective fiction featuring the Belgian detective Hercule Poirot. It was first published in the United Kingdom by the Collins Crime Club.",
    totalPages: 256,
    availability: true,
    rating: 4.5,
    borrowedBy: null,
    borrowedDate: null,
    returnDueDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "The Shining",
    authorId: sampleAuthors[3]._id, // Stephen King
    isbn: "9780307743657",
    genre: "Horror",
    publishedDate: "1977-01-28",
    description: "A horror novel that centers on the life of Jack Torrance, an aspiring writer and recovering alcoholic who accepts a position as the off-season caretaker of the isolated historic Overlook Hotel.",
    totalPages: 447,
    availability: true,
    rating: 4.6,
    borrowedBy: null,
    borrowedDate: null,
    returnDueDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Beloved",
    authorId: sampleAuthors[4]._id, // Toni Morrison
    isbn: "9781400033416",
    genre: "Historical Fiction",
    publishedDate: "1987-09-01",
    description: "A novel inspired by the life of Margaret Garner, an African American who escaped slavery in Kentucky by fleeing to Ohio, a free state.",
    totalPages: 324,
    availability: false,
    rating: 4.4,
    borrowedBy: "Sarah Johnson",
    borrowedDate: new Date('2024-09-15'),
    returnDueDate: new Date('2024-09-29'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    authorId: sampleAuthors[0]._id, // J.K. Rowling
    isbn: "9780747538493",
    genre: "Fantasy",
    publishedDate: "1998-07-02",
    description: "The second novel in the Harry Potter series. The plot follows Harry's second year at Hogwarts School of Witchcraft and Wizardry, during which a series of messages on the walls of the school's corridors warn that the Chamber of Secrets has been opened.",
    totalPages: 251,
    availability: true,
    rating: 4.7,
    borrowedBy: null,
    borrowedDate: null,
    returnDueDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "A Clash of Kings", 
    authorId: sampleAuthors[1]._id, // George R.R. Martin
    isbn: "9780553108033",
    genre: "Epic Fantasy",
    publishedDate: "1999-02-02",
    description: "The second novel in A Song of Ice and Fire series. The novel describes the increasingly vicious War of Five Kings in Westeros, Daenerys's strengthening forces in Essos, and the oncoming threat of the Others north of the Wall.",
    totalPages: 761,
    availability: true,
    rating: 4.6,
    borrowedBy: null,
    borrowedDate: null,
    returnDueDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "And Then There Were None",
    authorId: sampleAuthors[2]._id, // Agatha Christie
    isbn: "9780062073488",
    genre: "Mystery",
    publishedDate: "1939-11-06",
    description: "A mystery novel and the world's best-selling mystery, and one of the best-selling novels of all time. The novel follows ten people, each with something to hide and something to fear, who are invited to a lonely mansion on Indian Island.",
    totalPages: 264,
    availability: true,
    rating: 4.8,
    borrowedBy: null,
    borrowedDate: null,
    returnDueDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Import sample library data into MongoDB
 * This function will seed the database with authors and books for testing
 */
const importSampleData = async () => {
  try {
    console.log('📚 Starting library database seeding process...');
    
    const db = getDB();
    
    // Check if data already exists
    const authorsCollection = db.collection('authors');
    const booksCollection = db.collection('books');
    
    const existingAuthorsCount = await authorsCollection.countDocuments();
    const existingBooksCount = await booksCollection.countDocuments();
    
    if (existingAuthorsCount > 0 || existingBooksCount > 0) {
      console.log(`📚 Database already contains ${existingAuthorsCount} authors and ${existingBooksCount} books. Skipping import.`);
      return;
    }
    
    // Insert authors first (since books reference authors)
    console.log('👥 Importing sample authors...');
    const authorsResult = await authorsCollection.insertMany(sampleAuthors);
    console.log(`✅ Successfully imported ${authorsResult.insertedCount} sample authors`);
    
    // Insert books 
    console.log('📖 Importing sample books...');
    const booksResult = await booksCollection.insertMany(sampleBooks);
    console.log(`✅ Successfully imported ${booksResult.insertedCount} sample books`);
    
    // Display the imported data
    console.log('\n📊 IMPORTED LIBRARY DATA SUMMARY:');
    console.log('=' .repeat(50));
    
    console.log('\n👥 AUTHORS:');
    const importedAuthors = await authorsCollection.find({}).toArray();
    importedAuthors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.name} (${author.nationality}) - Born: ${author.birthDate} - ID: ${author._id}`);
    });
    
    console.log('\n📚 BOOKS:');
    const importedBooks = await booksCollection.aggregate([
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' }
    ]).toArray();
    
    importedBooks.forEach((book, index) => {
      const status = book.availability ? '✅ Available' : `❌ Borrowed by ${book.borrowedBy}`;
      console.log(`${index + 1}. "${book.title}" by ${book.author.name} (${book.genre}) - ${status} - ID: ${book._id}`);
    });
    
    console.log('\n🎉 Library database seeding completed successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error importing sample library data:', error);
    throw error;
  }
};

/**
 * Clear all library data from the database
 * Useful for testing or resetting the database
 */
const clearLibraryData = async () => {
  try {
    console.log('🧹 Clearing all library data...');
    
    const db = getDB();
    
    const authorsResult = await db.collection('authors').deleteMany({});
    const booksResult = await db.collection('books').deleteMany({});
    
    console.log(`✅ Cleared ${authorsResult.deletedCount} authors and ${booksResult.deletedCount} books`);
    
  } catch (error) {
    console.error('❌ Error clearing library data:', error);
    throw error;
  }
};

export {
  importSampleData,
  clearLibraryData,
  sampleAuthors,
  sampleBooks
};
