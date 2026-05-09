# Library Management System API 

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

### 2.Configure Environment
cp .env.example .env

