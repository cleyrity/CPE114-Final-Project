# Library Management System API 📖

A REST-ful API for managing library operations including books, members, authors, and borrowing records. Built with Node.js, Express, Sequelize, and MySQL.

## What It Does

Coded a comprehensive API that digitizes library management and streamlines borrowing operations.

The data model mirrors how real libraries work: an author writes multiple books, a library has many members, and members can borrow multiple books with tracking of due dates, returns, and fines.

## Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| Node.js | 20.x | Runtime |
| Express.js | 4.19.x | Routing and middleware |
| Sequelize | 6.37.x | ORM |
| MySQL | 8.x | Database |
| dotenv | 16.4.x | Environment config |
| mysql2 | 3.9.x | MySQL driver |
| cors | 2.8.x | Cross-origin support |
| nodemon | 3.0.x | Development auto-restart |

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/library-api.git
cd library-api
npm install
```

### 2.Configure Environment
```bash
cp .env.example .env
```
Fill in your database credentials in .env:
```env
DB_HOST=localhost
DB_PORT=3000
DB_NAME=library_db
DB_USER=root
DB_PASS=yourpassword
PORT=3000
```

### 3. Create the database
```sql
CREATE DATABASE library_db;
```

### 4. Start the server 
```bash
node index.js or npm start
```
Sequelize will handle table creation automatically. You should see:
```text
✅ Database connected successfully
✅ All models synced with database

📚 LIBRARY MANAGEMENT API
🚀 Server running on http://localhost:3000
```

## Database Schema

authors
================================================================================
Column          | Type           | Constraints                    | Description
----------------|----------------|--------------------------------|--------------------
id              | INTEGER        | PRIMARY KEY, AUTO_INCREMENT    | Unique author ID
name            | VARCHAR(255)   | NOT NULL                       | Author's full name
email           | VARCHAR(255)   | NOT NULL, UNIQUE               | Author's email
biography       | TEXT           | NULL                           | Author's bio
nationality     | VARCHAR(255)   | NOT NULL                       | Country of origin
birthDate       | DATEONLY       | NULL                           | Birth date (YYYY-MM-DD)
website         | VARCHAR(255)   | NULL                           | Personal website
createdAt       | DATETIME       | NOT NULL                       | Record creation time
updatedAt       | DATETIME       | NOT NULL                       | Last update time

================================================================================

members
================================================================================
Column          | Type           | Constraints                    | Description
----------------|----------------|--------------------------------|--------------------
id              | INTEGER        | PRIMARY KEY, AUTO_INCREMENT    | Unique member ID
name            | VARCHAR(255)   | NOT NULL                       | Member's full name
email           | VARCHAR(255)   | NOT NULL, UNIQUE               | Member's email
membershipId    | VARCHAR(255)   | NOT NULL, UNIQUE               | Library card number
phone           | VARCHAR(255)   | NOT NULL                       | Contact number
address         | TEXT           | NULL                           | Home address
membershipType  | ENUM           | NOT NULL                       | Basic, Premium, Student
joinDate        | DATETIME       | DEFAULT NOW                    | Date joined
isActive        | BOOLEAN        | DEFAULT TRUE                   | Active status
createdAt       | DATETIME       | NOT NULL                       | Record creation time
updatedAt       | DATETIME       | NOT NULL                       | Last update time

MembershipType Values: 'Basic', 'Premium', 'Student'

================================================================================

books
================================================================================
Column          | Type           | Constraints                    | Description
----------------|----------------|--------------------------------|--------------------
id              | INTEGER        | PRIMARY KEY, AUTO_INCREMENT    | Unique book ID
title           | VARCHAR(255)   | NOT NULL                       | Book title
isbn            | VARCHAR(255)   | NOT NULL, UNIQUE               | ISBN number
publisher       | VARCHAR(255)   | NOT NULL                       | Publishing company
publicationYear | INTEGER        | NOT NULL                       | Year published
genre           | VARCHAR(255)   | NOT NULL                       | Book genre
totalCopies     | INTEGER        | NOT NULL, MIN 1                | Total copies owned
availableCopies | INTEGER        | NOT NULL, MIN 0                | Copies available
authorId        | INTEGER        | NOT NULL, FOREIGN KEY          | References authors(id)
createdAt       | DATETIME       | NOT NULL                       | Record creation time
updatedAt       | DATETIME       | NOT NULL                       | Last update time

Foreign Key: books.authorId → authors.id

================================================================================

borrow_records
================================================================================
Column          | Type           | Constraints                    | Description
----------------|----------------|--------------------------------|--------------------
id              | INTEGER        | PRIMARY KEY, AUTO_INCREMENT    | Unique record ID
memberId        | INTEGER        | NOT NULL, FOREIGN KEY          | References members(id)
bookId          | INTEGER        | NOT NULL, FOREIGN KEY          | References books(id)
borrowDate      | DATETIME       | NOT NULL                       | When book was borrowed
dueDate         | DATETIME       | NOT NULL                       | Expected return date
returnDate      | DATETIME       | NULL                           | Actual return date
status          | ENUM           | NOT NULL                       | Borrowed, Returned, Overdue
fineAmount      | DECIMAL(10,2)  | DEFAULT 0.00                   | Late return fine
notes           | TEXT           | NULL                           | Additional notes
createdAt       | DATETIME       | NOT NULL                       | Record creation time
updatedAt       | DATETIME       | NOT NULL                       | Last update time

Foreign Keys:
  - borrow_records.memberId → members.id
  - borrow_records.bookId → books.id

Status Values: 'Borrowed', 'Returned', 'Overdue'

## RELATIONSHIPS
┌─────────────────────────────────────────────────────────────────────────────┐
│ ONE-TO-MANY                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   authors (1) ────────── has many ──────────► books (Many)                  │
│                                                                             │
│   Implementation:                                                           │
│   - Author.hasMany(Book)                                                    │
│   - Book.belongsTo(Author)                                                  │
│   - Foreign key: books.authorId → authors.id                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ MANY-TO-MANY                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   members (Many) ────── borrows ──────► books (Many)                        │
│                                                                             │
│   Junction Table: borrow_records                                            │
│                                                                             │
│   Implementation:                                                           │
│   - Member.belongsToMany(Book, { through: BorrowRecord })                   │
│   - Book.belongsToMany(Member, { through: BorrowRecord })                   │
│   - Foreign keys:                                                           │
│        borrow_records.memberId → members.id                                 │
│        borrow_records.bookId → books.id                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

## Example Requests & Responses

### Create an Author
POST /api/authors
```json
{
  "name": "Coleen Hoover",
  "email": "choover@gmail.com",
  "nationality": "American",
  "biography": "Author of It Ends With Us"
}
```
Response (201 Created)
```json
{
  "id": 1,
  "name": "Colleen Hoover",
  "email": "choover@gmail.com",
  "nationality": "American",
  "biography": "Author of It Ends With Us",
  "createdAt": "2026-05-09T10:30:00.000Z",
  "updatedAt": "2026-05-09T10:30:00.000Z"
}
```

### Borrow a Book
POST /api/borrows
```json
{
  "memberId": 1,
  "bookId": 1,
  "dueDate": "2026-05-10T23:59:59.000Z"
}
```
Response (201 Created)
```json
{
  "id": 1,
  "memberId": 1,
  "bookId": 1,
  "borrowDate": "2024-01-15T10:30:00.000Z",
  "dueDate": "2024-02-15T23:59:59.000Z",
  "status": "Borrowed",
  "fineAmount": 0
}
```
### Return a Book
PUT /api/borrows/1/return
Response (200 OK)
```json
{
  "message": "Book returned successfully",
  "borrowRecord": {
    "id": 1,
    "status": "Returned",
    "returnDate": "2024-01-20T10:30:00.000Z",
    "fineAmount": 0
  },
  "fineAmount": 0
}
```

### Get Member with Stats
GET /api/members/1
Response (200 OK)
```json
{
  "id": 1,
  "name": "Kimi Antonelli",
  "email": "kimi@gmail.com",
  "membershipId": "LIB001",
  "membershipType": "Premium",
  "isActive": true,
  "stats": {
    "totalBorrowed": 5,
    "currentlyBorrowed": 2,
    "totalFines": 0
  },
  "Books": [
    {
      "id": 1,
      "title": "1984",
      "BorrowRecords": {
        "borrowDate": "2026-05-09",
        "dueDate": "2026-05-11",
        "status": "Borrowed"
      }
    }
  ]
}
```

## Error Handling
All errors return JSON with a consistent shape.

| Status |	Cause |	Response |
|------------|---------|------|
| 400 |	Missing or invalid fields	| { "error": "Missing required fields", "required": ["name", "email"] } |
| 400 |	Duplicate entry |	{ "error": "Duplicate entry", "details": ["email must be unique"] } |
| 400	| No available copies |	{ "error": "No available copies of this book" } |
| 400 |	Already borrowed |	{ "error": "Member already has this book borrowed" } |
| 404 |	Resource not found |	{ "error": "Author/Member/Book not found" } |
| 404 |	Unknown route |	{ "error": "Route not found", "message": "Cannot GET /api/invalid" } |
| 500 |	Server error	| { "error": "Internal server error", "message": "Something went wrong" } |


##Project Structure
```text
library-api/
├── index.js                   # Main entry point (starts server)
├── package.json               # Dependencies and scripts
├── .env.example               # Template for .env
├── README.md                  # API documentation
├── config/
│   └── database.js            # Sequelize database connection setup
├── models/
│   ├── index.js               # Associations
│   ├── Author.js              # Author schema
│   ├── Book.js                # Book schema definition
│   ├── Member.js              # Member/Library User schema
│   └── BorrowRecord.js        # Junction table for borrowing
├── controllers/
│   ├── authorController.js    # CRUD operations for authors
│   ├── bookController.js      # CRUD operations for books
│   ├── memberController.js    # CRUD operations for members
│   └── borrowController.js    # Borrow/return logic
├── routes/
│   ├── authorRoutes.js        # /api/authors routes
│   ├── bookRoutes.js          # /api/books routes
│   ├── memberRoutes.js        # /api/members routes
│   └── borrowRoutes.js        # /api/borrows routes
└── middleware/
    ├── logger.js              # Logs every request
    ├── notFound.js            # Handles 404 errors
    └── errorHandler.js        # Global error handler (4 params)
├── docs/
│   └── postman_collection.json
```
