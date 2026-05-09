const { Author, Book } = require('../models');

// GET /api/authors
exports.getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.findAll();
    res.json(authors);
  } catch (err) {
    next(err);
  }
};

// GET /api/authors/:id
exports.getAuthorById = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      include: [{ model: Book }]
    });
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    res.json(author);
  } catch (err) {
    next(err);
  }
};

// POST /api/authors
exports.createAuthor = async (req, res, next) => {
  try {
    const { name, email, nationality, biography } = req.body;
    
    if (!name || !email || !nationality) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'nationality']
      });
    }
    
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (err) {
    next(err);
  }
};

// PUT /api/authors/:id
exports.updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    await author.update(req.body);
    res.json(author);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/authors/:id
exports.deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    // Check if author has books
    const bookCount = await Book.count({ where: { authorId: req.params.id } });
    
    if (bookCount > 0) {
      return res.status(400).json({ error: 'Cannot delete author with existing books. Delete or reassign books first.' });
    }
    
    await author.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /api/authors/:authorId/books
exports.getAuthorBooks = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.authorId);
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    const books = await Book.findAll({
      where: { authorId: req.params.authorId }
    });
    
    res.json(books);
  } catch (err) {
    next(err);
  }
};