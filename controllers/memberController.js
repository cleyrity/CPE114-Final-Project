const { Member, Book, BorrowRecord } = require('../models');
const { Op } = require('sequelize');

// GET /api/members
exports.getAllMembers = async (req, res, next) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    next(err);
  }
};

// GET /api/members/:id
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        {
          model: Book,
          through: { attributes: ['borrowDate', 'dueDate', 'returnDate', 'status', 'fineAmount'] },
          where: { '$BorrowRecords.status$': 'Borrowed' },
          required: false
        }
      ]
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Get borrowing stats
    const totalBorrowed = await BorrowRecord.count({
      where: { memberId: req.params.id }
    });
    
    const currentlyBorrowed = await BorrowRecord.count({
      where: { memberId: req.params.id, status: 'Borrowed' }
    });
    
    const totalFines = await BorrowRecord.sum('fineAmount', {
      where: { memberId: req.params.id }
    });
    
    res.json({
      ...member.toJSON(),
      stats: {
        totalBorrowed,
        currentlyBorrowed,
        totalFines: totalFines || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/members
exports.createMember = async (req, res, next) => {
  try {
    const { name, email, membershipId, phone, membershipType } = req.body;
    
    if (!name || !email || !membershipId || !phone || !membershipType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'membershipId', 'phone', 'membershipType']
      });
    }
    
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

// PUT /api/members/:id
exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    await member.update(req.body);
    res.json(member);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/members/:id
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Check if member has active borrow records
    const activeBorrows = await BorrowRecord.findOne({
      where: {
        memberId: req.params.id,
        status: 'Borrowed'
      }
    });
    
    if (activeBorrows) {
      return res.status(400).json({ error: 'Cannot delete member with active borrowed books' });
    }
    
    await member.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// GET /api/members/:memberId/borrow-history
exports.getBorrowHistory = async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const borrowHistory = await BorrowRecord.findAll({
      where: { memberId: req.params.memberId },
      include: [{ model: Book, attributes: ['title', 'isbn', 'genre'] }],
      order: [['borrowDate', 'DESC']]
    });
    
    res.json(borrowHistory);
  } catch (err) {
    next(err);
  }
};