const { BorrowRecord, Member, Book } = require('../models');
const { Op } = require('sequelize');

// POST /api/borrows - Borrow a book
exports.borrowBook = async (req, res, next) => {
  try {
    const { memberId, bookId, dueDate } = req.body;
    
    if (!memberId || !bookId || !dueDate) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['memberId', 'bookId', 'dueDate']
      });
    }
    
    // Check if member exists and is active
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    if (!member.isActive) {
      return res.status(400).json({ error: 'Member account is inactive' });
    }
    
    // Check if book exists and has available copies
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.availableCopies < 1) {
      return res.status(400).json({ error: 'No available copies of this book' });
    }
    
    // Check if member already has this book borrowed
    const existingBorrow = await BorrowRecord.findOne({
      where: {
        memberId,
        bookId,
        status: 'Borrowed'
      }
    });
    
    if (existingBorrow) {
      return res.status(400).json({ error: 'Member already has this book borrowed' });
    }
    
    // Create borrow record
    const borrowRecord = await BorrowRecord.create({
      memberId,
      bookId,
      dueDate,
      borrowDate: new Date(),
      status: 'Borrowed'
    });
    
    // Decrease available copies
    await book.update({ availableCopies: book.availableCopies - 1 });
    
    res.status(201).json(borrowRecord);
  } catch (err) {
    next(err);
  }
};

// PUT /api/borrows/:borrowId/return - Return a book
exports.returnBook = async (req, res, next) => {
  try {
    const borrowRecord = await BorrowRecord.findByPk(req.params.borrowId);
    
    if (!borrowRecord) {
      return res.status(404).json({ error: 'Borrow record not found' });
    }
    
    if (borrowRecord.status === 'Returned') {
      return res.status(400).json({ error: 'Book already returned' });
    }
    
    const returnDate = new Date();
    const dueDate = new Date(borrowRecord.dueDate);
    
    // Calculate fine if overdue
    let fineAmount = 0;
    if (returnDate > dueDate) {
      const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * 10; // $10 per day fine
    }
    
    await borrowRecord.update({
      returnDate,
      status: 'Returned',
      fineAmount
    });
    
    // Increase available copies
    const book = await Book.findByPk(borrowRecord.bookId);
    await book.update({ availableCopies: book.availableCopies + 1 });
    
    res.json({
      message: 'Book returned successfully',
      borrowRecord,
      fineAmount
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/borrows - List all borrow records
exports.getAllBorrowRecords = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const borrowRecords = await BorrowRecord.findAll({
      where,
      include: [
        { model: Member, attributes: ['name', 'membershipId'] },
        { model: Book, attributes: ['title', 'isbn', 'genre'] }
      ],
      order: [['borrowDate', 'DESC']]
    });
    res.json(borrowRecords);
  } catch (err) {
    next(err);
  }
};

// GET /api/borrows/overdue - Get all overdue books
exports.getOverdueBooks = async (req, res, next) => {
  try {
    const overdueRecords = await BorrowRecord.findAll({
      where: {
        status: 'Borrowed',
        dueDate: { [Op.lt]: new Date() }
      },
      include: [
        { model: Member, attributes: ['name', 'email', 'phone'] },
        { model: Book, attributes: ['title', 'isbn'] }
      ]
    });
    res.json(overdueRecords);
  } catch (err) {
    next(err);
  }
};

// GET /api/borrows/member/:memberId
exports.getMemberBorrows = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const borrows = await BorrowRecord.findAll({
      where: { memberId: req.params.memberId },
      include: [{ model: Book, attributes: ['title', 'isbn', 'genre'] }],
      order: [['borrowDate', 'DESC']]
    });
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};