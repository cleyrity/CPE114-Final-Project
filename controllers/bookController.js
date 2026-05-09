const { Book, Author, Member, BorrowRecord } = require('../models');
const { Op } = require('sequelize');

// GET /api/books
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.findAll({
      include: [{ model: Author, attributes: ['name', 'nationality'] }]
    });
    res.json(books);
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author },
        { 
          model: Member, 
          through: { attributes: ['borrowDate', 'dueDate', 'returnDate', 'status'] },
          where: { '$BorrowRecords.status$': 'Borrowed' },
          required: false
        }
      ]
    });
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const { title, isbn, publisher, publicationYear, genre, totalCopies, authorId } = req.body;
    
    if (!title || !isbn || !publisher || !publicationYear || !genre || !totalCopies || !authorId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'isbn', 'publisher', 'publicationYear', 'genre', 'totalCopies', 'authorId']
      });
    }
    
    // Check if author exists
    const author = await Author.findByPk(authorId);
    if (!author) {
      return res.status(400).json({ error: 'Author not found' });
    }
    
    const book = await Book.create({
      ...req.body,
      availableCopies: totalCopies
    });
    
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // If totalCopies is updated, adjust availableCopies
    if (req.body.totalCopies !== undefined) {
      const copiesDifference = req.body.totalCopies - book.totalCopies;
      req.body.availableCopies = book.availableCopies + copiesDifference;
    }
    
    await book.update(req.body);
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Check if book has active borrow records
    const activeBorrows = await BorrowRecord.findOne({
      where: {
        bookId: req.params.id,
        status: 'Borrowed'
      }
    });
    
    if (activeBorrows) {
      return res.status(400).json({ error: 'Cannot delete book with active borrow records' });
    }
    
    await book.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /api/books/available - Get all available books
exports.getAvailableBooks = async (req, res, next) => {
  try {
    const books = await Book.findAll({
      where: {
        availableCopies: { [Op.gt]: 0 }
      },
      include: [{ model: Author, attributes: ['name'] }]
    });
    res.json(books);
  } catch (err) {
    next(err);
  }
};