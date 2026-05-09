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
Column	Type	Notes
id	INTEGER	PK, auto increment
name	VARCHAR(255)	required
email	VARCHAR(255)	required, unique
biography	TEXT	optional
nationality	VARCHAR(255)	required
birthDate	DATEONLY	optional
website	VARCHAR(255)	optional
createdAt / updatedAt	DATETIME	managed by Sequelize
