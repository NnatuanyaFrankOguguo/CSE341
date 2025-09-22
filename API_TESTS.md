# 🧪 API Test Commands

This file contains curl commands to test all the Digital Library Management API endpoints.

## Health Check
curl "http://localhost:3000/health"

## Get API Information
curl "http://localhost:3000/"

## Books API Tests

### Get All Books
curl "http://localhost:3000/api/books"

### Get Books with Filtering
curl "http://localhost:3000/api/books?genre=Fantasy&page=1&limit=5"

### Get All Available Books
curl "http://localhost:3000/api/books?availability=true"

### Get Book by ID (replace BOOK_ID with actual ID from the books list)
curl "http://localhost:3000/api/books/BOOK_ID"

### Create New Book (replace AUTHOR_ID with actual author ID)
curl -X POST "http://localhost:3000/api/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "authorId": "AUTHOR_ID",
    "isbn": "9781234567890",
    "genre": "Test Genre",
    "publishedDate": "2024-01-01",
    "description": "A test book for API testing",
    "totalPages": 200,
    "rating": 4.0
  }'

### Update Book (replace BOOK_ID with actual ID)
curl -X PUT "http://localhost:3000/api/books/BOOK_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.5,
    "genre": "Updated Genre"
  }'

### Borrow Book (replace BOOK_ID with actual ID)
curl -X POST "http://localhost:3000/api/books/BOOK_ID/borrow" \
  -H "Content-Type: application/json" \
  -d '{
    "borrowerInfo": "Test User"
  }'

### Return Book (replace BOOK_ID with actual ID)
curl -X POST "http://localhost:3000/api/books/BOOK_ID/return"

### Delete Book (replace BOOK_ID with actual ID)
curl -X DELETE "http://localhost:3000/api/books/BOOK_ID"

## Authors API Tests

### Get All Authors
curl "http://localhost:3000/api/authors"

### Get Authors with Filtering
curl "http://localhost:3000/api/authors?nationality=American&page=1&limit=3"

### Get Author by ID (replace AUTHOR_ID with actual ID)
curl "http://localhost:3000/api/authors/AUTHOR_ID"

### Create New Author
curl -X POST "http://localhost:3000/api/authors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Author",
    "bio": "A test author for API testing purposes",
    "birthDate": "1980-01-01",
    "nationality": "Test Nationality",
    "email": "test@testauthor.com",
    "website": "https://www.testauthor.com",
    "socialMedia": {
      "twitter": "@testauthor",
      "instagram": "@testauthor"
    },
    "awards": ["Test Award 1", "Test Award 2"]
  }'

### Update Author (replace AUTHOR_ID with actual ID)
curl -X PUT "http://localhost:3000/api/authors/AUTHOR_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated biography for the test author",
    "website": "https://www.updated-testauthor.com"
  }'

### Add Award to Author (replace AUTHOR_ID with actual ID)
curl -X POST "http://localhost:3000/api/authors/AUTHOR_ID/awards" \
  -H "Content-Type: application/json" \
  -d '{
    "award": "New Test Award"
  }'

### Delete Author (replace AUTHOR_ID with actual ID - only works if author has no books)
curl -X DELETE "http://localhost:3000/api/authors/AUTHOR_ID"

## PowerShell Alternatives (for Windows)

If curl is not available, use these PowerShell commands:

### Health Check
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET

### Get All Books
Invoke-RestMethod -Uri "http://localhost:3000/api/books" -Method GET

### Get All Authors
Invoke-RestMethod -Uri "http://localhost:3000/api/authors" -Method GET

### Create New Book
$bookData = @{
    title = "Test Book"
    authorId = "AUTHOR_ID"
    isbn = "9781234567890"
    genre = "Test Genre"
    publishedDate = "2024-01-01"
    description = "A test book for API testing"
    totalPages = 200
    rating = 4.0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/books" -Method POST -Body $bookData -ContentType "application/json"

### Create New Author
$authorData = @{
    name = "Test Author"
    bio = "A test author for API testing purposes"
    birthDate = "1980-01-01"
    nationality = "Test Nationality"
    email = "test@testauthor.com"
    website = "https://www.testauthor.com"
    socialMedia = @{
        twitter = "@testauthor"
        instagram = "@testauthor"
    }
    awards = @("Test Award 1", "Test Award 2")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/authors" -Method POST -Body $authorData -ContentType "application/json"