const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const Book = require('./Book')(sequelize, DataTypes);
const Member = require('./Member')(sequelize, DataTypes);
const Author = require('./Author')(sequelize, DataTypes);
const BorrowRecord = require('./BorrowRecord')(sequelize, DataTypes);

// ========== ASSOCIATIONS ==========

// 1-to-many: Author -> Books
Author.hasMany(Book, { foreignKey: 'authorId' });
Book.belongsTo(Author, { foreignKey: 'authorId' });

// Many-to-many: Member <-> Book through BorrowRecord
Member.belongsToMany(Book, { 
  through: BorrowRecord, 
  foreignKey: 'memberId',
  otherKey: 'bookId'
});
Book.belongsToMany(Member, { 
  through: BorrowRecord, 
  foreignKey: 'bookId',
  otherKey: 'memberId'
});

// BorrowRecord belongs to both
BorrowRecord.belongsTo(Member, { foreignKey: 'memberId' });
BorrowRecord.belongsTo(Book, { foreignKey: 'bookId' });
Member.hasMany(BorrowRecord, { foreignKey: 'memberId' });
Book.hasMany(BorrowRecord, { foreignKey: 'bookId' });

module.exports = {
  sequelize,
  Book,
  Member,
  Author,
  BorrowRecord
};